'use client';

import { useState } from 'react';
import { Card, CardBody, Tabs, Tab } from '@nextui-org/react';
import type { LeaderboardType } from '@quiz/shared';

// Empty leaderboard - will be populated as users play
const emptyLeaderboard = [
  { rank: 1, displayName: 'Player', score: 0 },
  { rank: 2, displayName: 'Player', score: 0 },
  { rank: 3, displayName: 'Player', score: 0 },
  { rank: 4, displayName: 'Player', score: 0 },
  { rank: 5, displayName: 'Player', score: 0 },
];

export function Leaderboards() {
  const [selectedTab, setSelectedTab] = useState<LeaderboardType>('daily');

  // TODO: Fetch actual leaderboard data from API
  const leaderboard = emptyLeaderboard;

  return (
    <Card className="bg-gray-800/50 backdrop-blur">
      <CardBody className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Leaderboards</h2>

        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as LeaderboardType)}
          classNames={{
            tabList: 'bg-gray-700/50',
            cursor: 'bg-primary-600',
            tab: 'text-gray-300',
            tabContent: 'group-data-[selected=true]:text-white',
          }}
        >
          <Tab key="daily" title="Today" />
          <Tab key="weekly" title="This Week" />
          <Tab key="allTime" title="All Time" />
        </Tabs>

        <div className="mt-4 space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className="leaderboard-entry flex items-center"
            >
              <div className="w-8 text-center font-bold text-gray-400">
                {entry.rank}
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-700 ml-2 flex items-center justify-center text-gray-500 text-xs">
                ?
              </div>
              <div className="flex-1 ml-3">
                <div className="font-semibold text-gray-500">
                  {entry.displayName}
                </div>
              </div>
              <div className="font-bold text-gray-500 font-mono">
                {entry.score.toString().padStart(3, '0')}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Play to get on the leaderboard!
        </div>
      </CardBody>
    </Card>
  );
}
