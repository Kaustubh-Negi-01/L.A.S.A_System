import React, { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { Flashcard } from '../../types';
import { generateFlashcards } from '../../services/geminiService';
import { useSharedContext } from '../../context/SharedContext';

interface FlashcardDeckProps {
  subject: string;
  topics: string[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ subject, topics }) => {
  const { getAiConfig } = useSharedContext();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const topicKey = useMemo(() => topics.join('|'), [topics]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());

    generateFlashcards(subject, topics, getAiConfig())
      .then(nextCards => {
        if (!isMounted) return;
        setCards(nextCards);
      })
      .catch(() => {
        if (isMounted) setError('Flashcards could not be prepared. Try refreshing the deck.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [subject, topicKey, getAiConfig]);

  const currentCard = cards[currentIndex];
  const masteredCount = masteredIds.size;

  const moveTo = (nextIndex: number) => {
    if (!cards.length) return;
    setCurrentIndex((nextIndex + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const markCard = (isMastered: boolean) => {
    if (!currentCard) return;
    setMasteredIds(previous => {
      const next = new Set(previous);
      if (isMastered) next.add(currentCard.id);
      else next.delete(currentCard.id);
      return next;
    });
    moveTo(currentIndex + 1);
  };

  return (
    <section className="glass-panel flashcard-deck" aria-label="Flashcard review deck" style={{ padding: '16px' }}>
      <div className="card-header-row" style={{ marginBottom: '10px' }}>
        <div className="card-title">
          <Brain size={17} color="var(--primary-cyan)" />
          <span>ACTIVE-RECALL FLASHCARDS</span>
        </div>
        <span className="badge badge-cyan">{masteredCount}/{cards.length || 6} MASTERED</span>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Try to answer from memory first. Flip only when you are ready to check the reasoning.
      </div>

      {isLoading ? (
        <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          <Sparkles size={20} color="var(--primary-cyan)" style={{ margin: '0 auto 8px' }} />
          Preparing a deeper review deck...
        </div>
      ) : error || !currentCard ? (
        <div style={{ padding: '18px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          {error || 'No flashcards available yet.'}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsFlipped(previous => !previous)}
            aria-label={isFlipped ? 'Show flashcard question' : 'Reveal flashcard answer'}
            style={{
              width: '100%',
              minHeight: '154px',
              padding: '18px',
              borderRadius: '6px',
              border: `1px solid ${isFlipped ? 'rgba(166, 178, 123, 0.5)' : 'rgba(0, 240, 255, 0.3)'}`,
              background: isFlipped ? 'rgba(166, 178, 123, 0.08)' : 'rgba(0, 240, 255, 0.06)',
              color: 'var(--text)',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', color: isFlipped ? '#a6b27b' : 'var(--primary-cyan)' }}>
              <span>{isFlipped ? 'ANSWER & STUDY CUE' : 'RECALL PROMPT'}</span>
              <span>{currentIndex + 1} / {cards.length}</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4 }}>
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
            <div style={{ marginTop: '14px', fontSize: '10px', color: 'var(--text-dim)' }}>
              {isFlipped ? `${currentCard.topic} · ${currentCard.difficulty}` : 'Tap to reveal'}
            </div>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="icon-btn" onClick={() => moveTo(currentIndex - 1)} aria-label="Previous flashcard">
              <ChevronLeft size={15} />
            </button>
            <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
              <button type="button" className="btn-secondary" onClick={() => markCard(false)} style={{ flex: 1, padding: '8px 6px', fontSize: '10px' }}>
                <RotateCcw size={12} /> Review again
              </button>
              <button type="button" className="btn-primary" onClick={() => markCard(true)} style={{ flex: 1, padding: '8px 6px', fontSize: '10px' }}>
                <CheckCircle2 size={12} /> I know this
              </button>
            </div>
            <button type="button" className="icon-btn" onClick={() => moveTo(currentIndex + 1)} aria-label="Next flashcard">
              <ChevronRight size={15} />
            </button>
          </div>
        </>
      )}
    </section>
  );
};
