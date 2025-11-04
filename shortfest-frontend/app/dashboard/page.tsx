'use client';

import { Navigation } from '../../components/Navigation';
import { useShortFestJury } from '../../hooks/useShortFestJury';
import { useWallet } from '../../hooks/useWallet';
import { useFhevm } from '../../fhevm/useFhevm';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function DashboardPage() {
  const { account, provider } = useWallet();
  const { instance: fhevmInstance } = useFhevm();
  const { 
    contract,
    getTotalFilms, 
    addFilm, 
    addJuror, 
    aggregateFilmScores,
    allowOrganizerDecrypt,
    publishQualifiedFilms,
    getAggregatedScore,
    isLoading 
  } = useShortFestJury();
  
  const [stats, setStats] = useState({ films: 0, jurors: 0 });
  const [activeTab, setActiveTab] = useState<'films' | 'jurors' | 'aggregate' | 'publish'>('films');
  
  // Film form
  const [filmForm, setFilmForm] = useState({
    title: '',
    director: '',
    duration: '',
    metadata: '',
  });
  
  // Juror form
  const [jurorAddress, setJurorAddress] = useState('');

  useEffect(() => {
    if (contract) {
      loadStats();
    }
  }, [contract]);

  const loadStats = async () => {
    try {
      const filmCount = await getTotalFilms();
      setStats({ films: filmCount, jurors: 0 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleAddFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionHash = ethers.id(filmForm.title);
      await addFilm(
        filmForm.title,
        filmForm.director,
        parseInt(filmForm.duration),
        submissionHash,
        filmForm.metadata
      );
      alert('Film added successfully!');
      setFilmForm({ title: '', director: '', duration: '', metadata: '' });
      loadStats();
    } catch (error) {
      console.error('Failed to add film:', error);
      alert('Failed to add film');
    }
  };

  const handleAddJuror = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addJuror(jurorAddress);
      alert('Juror added successfully!');
      setJurorAddress('');
    } catch (error) {
      console.error('Failed to add juror:', error);
      alert('Failed to add juror');
    }
  };

  const handleAggregate = async (filmId: number) => {
    try {
      await aggregateFilmScores(filmId);
      alert(`✅ Aggregated scores for film ${filmId}\n\nNext steps:\n1. Click "Decrypt & Publish" tab\n2. Authorize decryption\n3. Decrypt and publish results`);
    } catch (error) {
      console.error('Failed to aggregate:', error);
      alert('Failed to aggregate scores');
    }
  };

  const handleAllowDecrypt = async (filmId: number) => {
    try {
      // Check aggregation status first
      const aggScore = await getAggregatedScore(filmId);
      console.log(`Film ${filmId} aggregation status:`, aggScore);
      
      if (!aggScore.isAggregated) {
        alert(`❌ Film ${filmId} has not been aggregated yet!\n\nPlease go to "Aggregate" tab and aggregate scores first.`);
        return;
      }
      
      console.log(`Film ${filmId} juror count: ${aggScore.jurorCount}`);
      
      await allowOrganizerDecrypt(filmId);
      alert(`✅ Decryption authorized for film ${filmId}\n\nNext: Click "Decrypt & Publish" to decrypt and publish results`);
    } catch (error) {
      console.error('Failed to authorize decryption:', error);
      alert(`Failed to authorize decryption: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublish = async (filmId: number) => {
    if (!contract || !fhevmInstance || !account || !provider) {
      alert('❌ Contract, FHEVM instance, or wallet not ready');
      return;
    }

    try {
      // Get aggregated score
      const aggScore = await getAggregatedScore(filmId);
      
      if (!aggScore.isAggregated) {
        alert(`❌ Film ${filmId} has not been aggregated yet!`);
        return;
      }

      const jurorCount = Number(aggScore.jurorCount);
      console.log(`Film ${filmId} - Aggregated, jurorCount: ${jurorCount}`);
      
      // Get contract address
      const contractAddress = await contract.getAddress();
      
      console.log('Raw aggScore:', aggScore);
      console.log('sumNarrative type:', typeof aggScore.sumNarrative, aggScore.sumNarrative);
      
      // Extract handle strings (handles are euint16 values stored as strings)
      const narrativeHandle = String(aggScore.sumNarrative);
      const cinematographyHandle = String(aggScore.sumCinematography);
      const soundHandle = String(aggScore.sumSound);
      const editingHandle = String(aggScore.sumEditing);
      
      console.log('Extracted handles:', {
        narrativeHandle,
        cinematographyHandle,
        soundHandle,
        editingHandle
      });
      
      // Prepare handles for decryption
      const handles = [
        { handle: narrativeHandle, contractAddress },
        { handle: cinematographyHandle, contractAddress },
        { handle: soundHandle, contractAddress },
        { handle: editingHandle, contractAddress },
      ];
      
      console.log('Handles to decrypt:', handles);
      
      // Generate keypair and get decryption signature
      alert('🔐 Generating decryption key and signature...\nPlease sign the message in MetaMask.');
      
      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      
      // Generate keypair
      const { publicKey, privateKey } = fhevmInstance.generateKeypair();
      
      // Create EIP712 message for signing
      const eip712 = fhevmInstance.createEIP712(
        publicKey,
        [contractAddress as `0x${string}`],
        Math.floor(Date.now() / 1000), // startTimestamp
        7 // durationDays
      );
      
      console.log('EIP712 message:', eip712.message);
      
      // Request user signature
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      
      console.log('Signature obtained, decrypting...');
      console.log('Decryption parameters:', {
        handlesCount: handles.length,
        privateKeyLength: privateKey.length,
        publicKeyLength: publicKey.length,
        signatureLength: signature.length,
        contractAddress,
        account,
        startTimestamp: eip712.message.startTimestamp,
        durationDays: eip712.message.durationDays
      });
      
      // Decrypt all handles
      const decryptedValues = await fhevmInstance.userDecrypt(
        handles,
        privateKey,
        publicKey,
        signature,
        [contractAddress as `0x${string}`],
        account as `0x${string}`,
        Number(eip712.message.startTimestamp),
        Number(eip712.message.durationDays)
      );
      
      console.log('Decrypted values:', decryptedValues);
      
      // Calculate averages using the handle strings as keys
      const decryptedValuesRecord = decryptedValues as Record<string, bigint>;
      const avgNarrative = Math.round(Number(decryptedValuesRecord[narrativeHandle]) / jurorCount);
      const avgCinematography = Math.round(Number(decryptedValuesRecord[cinematographyHandle]) / jurorCount);
      const avgSound = Math.round(Number(decryptedValuesRecord[soundHandle]) / jurorCount);
      const avgEditing = Math.round(Number(decryptedValuesRecord[editingHandle]) / jurorCount);
      
      console.log('Calculated averages:', { avgNarrative, avgCinematography, avgSound, avgEditing });
      
      // Publish results
      alert(`📊 Decrypted averages:\n\nNarrative: ${avgNarrative}\nCinematography: ${avgCinematography}\nSound: ${avgSound}\nEditing: ${avgEditing}\n\nPublishing to blockchain...`);
      
      await publishQualifiedFilms(
        [filmId],
        [avgNarrative],
        [avgCinematography],
        [avgSound],
        [avgEditing]
      );
      
      alert(`✅ Successfully published results for film ${filmId}!\n\nAverages:\n- Narrative: ${avgNarrative}\n- Cinematography: ${avgCinematography}\n- Sound: ${avgSound}\n- Editing: ${avgEditing}\n\nCheck /results page to view public results.`);
      
    } catch (error) {
      console.error('Failed to decrypt and publish:', error);
      alert(`Failed to decrypt and publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl text-text-secondary">Please connect your wallet to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Organizer Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="card">
            <div className="text-text-secondary mb-2">Total Films</div>
            <div className="text-3xl font-bold">{stats.films}</div>
          </div>
          <div className="card">
            <div className="text-text-secondary mb-2">Total Jurors</div>
            <div className="text-3xl font-bold">{stats.jurors}</div>
          </div>
          <div className="card">
            <div className="text-text-secondary mb-2">Completed Reviews</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="card">
            <div className="text-text-secondary mb-2">Qualified Films</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {(['films', 'jurors', 'aggregate', 'publish'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-background-elevated text-text-secondary hover:bg-accent'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'films' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Add Film</h2>
            <form onSubmit={handleAddFilm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={filmForm.title}
                  onChange={(e) => setFilmForm({ ...filmForm, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Director *</label>
                <input
                  type="text"
                  value={filmForm.director}
                  onChange={(e) => setFilmForm({ ...filmForm, director: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (seconds) *</label>
                <input
                  type="number"
                  value={filmForm.duration}
                  onChange={(e) => setFilmForm({ ...filmForm, duration: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Metadata (JSON)</label>
                <textarea
                  value={filmForm.metadata}
                  onChange={(e) => setFilmForm({ ...filmForm, metadata: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder='{"country": "USA", "year": 2025}'
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Film'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'jurors' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Add Juror</h2>
            <form onSubmit={handleAddJuror} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Juror Address *</label>
                <input
                  type="text"
                  value={jurorAddress}
                  onChange={(e) => setJurorAddress(e.target.value)}
                  className="input-field"
                  placeholder="0x..."
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Juror'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'aggregate' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Aggregate Scores</h2>
            <p className="text-text-secondary mb-4">
              Trigger aggregation for films with submitted scores
            </p>
            <div className="space-y-4">
              {[...Array(stats.films)].map((_, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-background-elevated rounded-lg">
                  <span>Film ID: {idx}</span>
                  <button
                    onClick={() => handleAggregate(idx)}
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    Aggregate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Decrypt & Publish Results</h2>
            
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-400 mb-2">📋 Workflow:</h3>
              <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
                <li>Aggregate scores (previous tab)</li>
                <li>Authorize decryption (click "Allow Decrypt" below)</li>
                <li>Decrypt sums using FHEVM SDK</li>
                <li>Calculate averages client-side</li>
                <li>Publish results on-chain (click "Decrypt & Publish")</li>
              </ol>
            </div>

            <div className="space-y-4">
              {[...Array(stats.films)].map((_, idx) => (
                <div key={idx} className="p-4 bg-background-elevated rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold">Film ID: {idx}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAllowDecrypt(idx)}
                      className="btn-secondary flex-1"
                      disabled={isLoading}
                    >
                      1. Allow Decrypt
                    </button>
                    <button
                      onClick={() => handlePublish(idx)}
                      className="btn-primary flex-1"
                      disabled={isLoading}
                    >
                      2. Decrypt & Publish
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Step 1 authorizes you to decrypt. Step 2 decrypts the aggregated sums and publishes results.
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-300">
                ✅ <strong>Full Implementation:</strong> The decrypt & publish flow is now fully implemented. 
                You'll be prompted to sign a decryption message in MetaMask, then the system will:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-green-300">
                <li>Decrypt the aggregated sums using FHEVM SDK</li>
                <li>Calculate averages (sum / jurorCount)</li>
                <li>Publish results on-chain for public viewing</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


