'use client';

import { Navigation } from '../../components/Navigation';
import { useShortFestJury } from '../../hooks/useShortFestJury';
import { useWallet } from '../../hooks/useWallet';
import { useFhevm } from '../../fhevm/useFhevm';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Film {
  id: number;
  title: string;
  director: string;
  duration: number;
  hasScored: boolean;
}

export default function ReviewPage() {
  const { account } = useWallet();
  const { instance: fhevmInstance, isLoading: fhevmLoading, error: fhevmError } = useFhevm();
  const { contract, getTotalFilms, getFilm, hasScored, submitScore, isLoading } = useShortFestJury();
  
  const [films, setFilms] = useState<Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [scores, setScores] = useState({
    narrative: 85,
    cinematography: 85,
    sound: 85,
    editing: 85,
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (account && contract) {
      loadFilms();
    }
  }, [account, contract]);

  const loadFilms = async () => {
    try {
      const count = await getTotalFilms();
      const filmList: Film[] = [];
      
      for (let i = 0; i < count; i++) {
        const filmData = await getFilm(i);
        const scored = account ? await hasScored(i, account) : false;
        
        filmList.push({
          id: i,
          title: filmData.title,
          director: filmData.director,
          duration: Number(filmData.duration),
          hasScored: scored,
        });
      }
      
      setFilms(filmList);
    } catch (error) {
      console.error('Failed to load films:', error);
    }
  };

  const handleSubmitScore = async () => {
    if (!selectedFilm) return;

    try {
      const commentHash = comment ? ethers.id(comment) : ethers.ZeroHash;
      
      await submitScore(
        selectedFilm.id,
        scores.narrative,
        scores.cinematography,
        scores.sound,
        scores.editing,
        commentHash
      );
      
      alert('Score submitted successfully!');
      setSelectedFilm(null);
      setComment('');
      loadFilms();
    } catch (error) {
      console.error('Failed to submit score:', error);
      alert('Failed to submit score');
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl text-text-secondary">Please connect your wallet to review films</p>
        </div>
      </div>
    );
  }

  const completedCount = films.filter((f) => f.hasScored).length;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Reviews</h1>
          <p className="text-text-secondary">
            Progress: {completedCount} / {films.length} films reviewed
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-background-elevated rounded-full h-3 mb-12">
          <div
            className="film-gradient h-3 rounded-full transition-all duration-500"
            style={{ width: `${films.length > 0 ? (completedCount / films.length) * 100 : 0}%` }}
          ></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Film List */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Film Library</h2>
            <div className="space-y-3">
              {films.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-text-secondary">No films available</p>
                </div>
              ) : (
                films.map((film) => (
                  <div
                    key={film.id}
                    onClick={() => !film.hasScored && setSelectedFilm(film)}
                    className={`card cursor-pointer transition-all ${
                      selectedFilm?.id === film.id
                        ? 'ring-2 ring-primary'
                        : film.hasScored
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:ring-2 hover:ring-secondary'
                    }`}
                  >
                    <h3 className="font-bold mb-1">{film.title}</h3>
                    <p className="text-sm text-text-secondary">by {film.director}</p>
                    <p className="text-sm text-text-muted mt-2">{Math.floor(film.duration / 60)} min</p>
                    {film.hasScored && (
                      <div className="mt-2 text-green-500 text-sm font-semibold">✓ Reviewed</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Score Form */}
          <div className="lg:col-span-2">
            {selectedFilm ? (
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">{selectedFilm.title}</h2>
                <p className="text-text-secondary mb-8">by {selectedFilm.director}</p>

                <div className="space-y-6 mb-8">
                  {Object.entries(scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-2">
                        <label className="font-semibold capitalize">{key}</label>
                        <span className="text-primary font-bold">{value} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setScores({ ...scores, [key]: parseInt(e.target.value) })}
                        className="w-full h-3 bg-background-elevated rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #E74C3C ${value}%, #16213E ${value}%)`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <label className="block font-semibold mb-2">Comments (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Your review comments..."
                  />
                  <p className="text-sm text-text-muted mt-2">
                    Only a hash of your comment will be stored on-chain
                  </p>
                </div>

                {fhevmError && (
                  <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">
                      <strong>FHEVM Initialization Error:</strong> {fhevmError.message}
                    </p>
                    <p className="text-red-400/70 text-xs mt-2">
                      Please ensure you're connected to a supported network (Localhost or Sepolia) and refresh the page.
                    </p>
                  </div>
                )}

                {!contract && !fhevmInstance && !fhevmError && (
                  <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      Initializing contract and FHEVM instance... Please wait.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmitScore}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !contract || !fhevmInstance || fhevmLoading || !!fhevmError}
                >
                  {isLoading ? 'Submitting...' : 
                   fhevmError ? 'Cannot Submit (Error)' :
                   !contract || !fhevmInstance ? 'Initializing...' : 
                   'Submit Encrypted Score'}
                </button>
              </div>
            ) : (
              <div className="card text-center py-20">
                <p className="text-2xl text-text-secondary mb-4">Select a film to review</p>
                <p className="text-text-muted">Choose an unreviewed film from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


