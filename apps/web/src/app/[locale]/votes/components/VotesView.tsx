'use client';

import { useState } from 'react';
import { VotesHero } from './VotesHero';
import { VotesList } from './VotesList';
import type { VoteFilter } from './types';

export function VotesView() {
  const [activeFilter, setActiveFilter] = useState<VoteFilter>('all');

  return (
    <>
      <VotesHero activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <VotesList filter={activeFilter} />
    </>
  );
}
