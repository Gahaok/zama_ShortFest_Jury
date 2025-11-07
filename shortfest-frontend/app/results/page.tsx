'use client';

import { Navigation } from '../../components/Navigation';
import { useShortFestJury } from '../../hooks/useShortFestJury';
import { useState, useEffect } from 'react';

interface QualifiedFilm {
  filmId: bigint;
  title: string;
  director: string;
  avgNarrative: number;
  avgCinematography: number;
  avgSound: number;
  avgEditing: number;
  publishedAt: bigint;
}

export default function ResultsPage() {
  const { contract, getAllQualifiedFilms } = useShortFestJury();
  const [films, setFilms] = useState<QualifiedFilm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'total' | 'title'>('total');

  useEffect(() => {
    if (contract) {
      loadFilms();
    }
  }, [contract]);

  const loadFilms = async () => {
    try {
      const results = await getAllQualifiedFilms();
      const formatted = results.map((r: any) => ({
        filmId: r.filmId,
        title: r.title,
        director: r.director,
        avgNarrative: Number(r.avgNarrative),
        avgCinematography: Number(r.avgCinematography),
        avgSound: Number(r.avgSound),
        avgEditing: Number(r.avgEditing),
        publishedAt: r.publishedAt,
      }));
      setFilms(formatted);
    } catch (error) {
      console.error('Failed to load qualified films:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedFilms = [...films].sort((a, b) => {
    if (sortBy === 'total') {
      const totalA = (a.avgNarrative + a.avgCinematography + a.avgSound + a.avgEditing) / 4;
      const totalB = (b.avgNarrative + b.avgCinematography + b.avgSound + b.avgEditing) / 4;
      return totalB - totalA;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Qualified Films - ShortFest 2025
          </h1>
          <p className="text-text-secondary text-lg">
            Winners selected through encrypted jury voting
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-text-secondary">
            {films.length} {films.length === 1 ? 'film' : 'films'} qualified
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('total')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'total'
                  ? 'bg-primary text-white'
                  : 'bg-background-elevated text-text-secondary hover:bg-accent'
              }`}
            >
              Sort by Score
            </button>
            <button
              onClick={() => setSortBy('title')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'title'
                  ? 'bg-primary text-white'
                  : 'bg-background-elevated text-text-secondary hover:bg-accent'
              }`}
            >
              Sort by Title
            </button>
          </div>
        </div>

        {/* Films Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-secondary">Loading results...</p>
          </div>
        ) : films.length === 0 ? (
          <div className="text-center py-20 card">
            <p className="text-2xl text-text-secondary mb-4">No results published yet</p>
            <p className="text-text-muted">Results will be published soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFilms.map((film) => {
              const totalScore = (film.avgNarrative + film.avgCinematography + film.avgSound + film.avgEditing) / 4;
              
              return (
                <div key={film.filmId.toString()} className="card">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">{film.title}</h3>
                    <p className="text-text-secondary">by {film.director}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <ScoreDimension label="Narrative" score={film.avgNarrative} />
                    <ScoreDimension label="Cinematography" score={film.avgCinematography} />
                    <ScoreDimension label="Sound" score={film.avgSound} />
                    <ScoreDimension label="Editing" score={film.avgEditing} />
                  </div>

                  <div className="pt-4 border-t border-text-muted/20">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Overall</span>
                      <span className="text-2xl font-bold film-gradient bg-clip-text text-transparent">
                        {totalScore.toFixed(1)}<span className="text-lg">/100</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreDimension({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="w-full bg-background-elevated rounded-full h-2">
        <div
          className="film-gradient h-2 rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}


