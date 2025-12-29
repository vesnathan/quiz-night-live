'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Avatar,
  Divider,
  Card,
  CardBody,
} from '@nextui-org/react';
import { useAuth } from '@/contexts/AuthContext';

interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  correctAnswers: number;
  averageResponseTime: number;
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerProfileModal({
  isOpen,
  onClose,
}: PlayerProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    if (user) {
      // Set display name from email prefix
      const emailPrefix = user.email.split('@')[0];
      setDisplayName(emailPrefix);

      // TODO: Fetch real stats from API
      setStats({
        gamesPlayed: 0,
        gamesWon: 0,
        totalPoints: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
      });
    }
  }, [user]);

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-gradient-to-br from-pink-500 to-orange-400',
      'bg-gradient-to-br from-cyan-500 to-blue-500',
      'bg-gradient-to-br from-green-400 to-cyan-500',
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save display name to API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      classNames={{
        base: 'bg-gray-900 border border-gray-700',
        header: 'border-b border-gray-700',
        body: 'py-6',
        footer: 'border-t border-gray-700',
      }}
    >
      <ModalContent>
        {(closeModal) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-1 text-white">
              <h2 className="text-xl font-bold">My Profile</h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-6">
                {/* Avatar */}
                <Avatar
                  className={`w-24 h-24 text-2xl ${getAvatarColor(user.email)}`}
                  name={getInitials(user.email)}
                  showFallback
                />

                {/* Display Name */}
                <div className="w-full max-w-sm">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        variant="bordered"
                        label="Display Name"
                        classNames={{
                          input: 'text-white',
                          label: 'text-gray-400',
                        }}
                      />
                      <Button
                        color="primary"
                        onPress={handleSave}
                        isLoading={loading}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Display Name</p>
                        <p className="text-white text-lg font-medium">{displayName}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="w-full max-w-sm">
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>

                <Divider className="bg-gray-700 my-2" />

                {/* Stats */}
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                  {stats && (
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-gray-800 border border-gray-700">
                        <CardBody className="text-center py-4">
                          <p className="text-3xl font-bold text-primary">{stats.gamesPlayed}</p>
                          <p className="text-gray-400 text-sm">Games Played</p>
                        </CardBody>
                      </Card>
                      <Card className="bg-gray-800 border border-gray-700">
                        <CardBody className="text-center py-4">
                          <p className="text-3xl font-bold text-green-500">{stats.gamesWon}</p>
                          <p className="text-gray-400 text-sm">Games Won</p>
                        </CardBody>
                      </Card>
                      <Card className="bg-gray-800 border border-gray-700">
                        <CardBody className="text-center py-4">
                          <p className="text-3xl font-bold text-yellow-500">{stats.totalPoints}</p>
                          <p className="text-gray-400 text-sm">Total Points</p>
                        </CardBody>
                      </Card>
                      <Card className="bg-gray-800 border border-gray-700">
                        <CardBody className="text-center py-4">
                          <p className="text-3xl font-bold text-cyan-500">{stats.correctAnswers}</p>
                          <p className="text-gray-400 text-sm">Correct Answers</p>
                        </CardBody>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="bordered"
                onPress={closeModal}
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
