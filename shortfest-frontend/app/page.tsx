'use client';

import Link from 'next/link';
import { Navigation } from '../components/Navigation';

/**
 * Home page component for ShortFest Jury
 * Displays hero section, features, and how it works guide
 */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="film-gradient bg-clip-text text-transparent">
              ShortFest Jury
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-4 animate-slide-up">
            Encrypted Film Judging on Blockchain
          </p>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-12 animate-slide-up">
            Privacy-preserving short film review system powered by FHEVM.  
            Fair, transparent, and verifiable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/review" className="btn-primary inline-block">
              Start Reviewing
            </Link>
            <Link href="/results" className="btn-secondary inline-block">
              View Public Results
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background-surface/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Core Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Encrypted Scoring</h3>
              <p className="text-text-secondary">
                All jury scores are fully encrypted on-chain using FHEVM, ensuring complete privacy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Homomorphic Aggregation</h3>
              <p className="text-text-secondary">
                Group averages computed directly on encrypted data without decrypting individual scores.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3">Transparent Results</h3>
              <p className="text-text-secondary">
                Qualified films and average scores are publicly verifiable on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {[
              { step: 1, title: 'Organizer adds films and jurors', desc: 'Festival organizer uploads film metadata and assigns jury members' },
              { step: 2, title: 'Jurors submit encrypted scores', desc: 'Each juror rates films on 4 dimensions (Narrative, Cinematography, Sound, Editing)' },
              { step: 3, title: 'Smart contract aggregates scores', desc: 'Using homomorphic encryption (FHE), scores are aggregated without decryption' },
              { step: 4, title: 'Organizer decrypts averages', desc: 'Only group averages are decrypted, individual scores remain private' },
              { step: 5, title: 'Public views qualified films', desc: 'Winning films and their average scores are published for all to see' },
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-6 card">
                <div className="flex-shrink-0 w-12 h-12 rounded-full film-gradient flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-text-muted/20">
        <div className="max-w-7xl mx-auto text-center text-text-secondary">
          <p>Built with FHEVM • Powered by Zama</p>
        </div>
      </footer>
    </div>
  );
}


