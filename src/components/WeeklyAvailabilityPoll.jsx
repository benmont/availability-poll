import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '../firebase';

const WeeklyAvailabilityPoll = () => {
  const [weeks, setWeeks] = useState([
    { id: 1, label: 'Jan 15-21' },
    { id: 2, label: 'Jan 22-28' },
    { id: 3, label: 'Jan 29-Feb 4' },
    { id: 4, label: 'Feb 5-11' }
  ]);
  
  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingWeekId, setEditingWeekId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [error, setError] = useState(null);

  // Subscribe to Firebase data
  useEffect(() => {
    const weeksRef = ref(db, 'weeks');
    const participantsRef = ref(db, 'participants');

    const unsubscribeWeeks = onValue(weeksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setWeeks(data);
    }, (error) => {
      console.error('Error loading weeks:', error);
      setError('Error loading data. Please refresh the page.');
    });

    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsArray = Object.values(data);
        setParticipants(participantsArray);
      } else {
        setParticipants([]);
      }
    }, (error) => {
      console.error('Error loading participants:', error);
      setError('Error loading data. Please refresh the page.');
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeWeeks();
      unsubscribeParticipants();
    };
  }, []);

  const toggleAvailability = async (participantId, weekIndex) => {
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      const newAvailability = [...participant.availability];
      newAvailability[weekIndex] = !newAvailability[weekIndex];

      await set(ref(db, `participants/${participantId}`), {
        ...participant,
        availability: newAvailability
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      setError('Failed to update availability. Please try again.');
    }
  };

  const addParticipant = async () => {
    if (!newParticipantName.trim()) return;

    try {
      const newParticipant = {
        id: Date.now().toString(), // Use timestamp as unique ID
        name: newParticipantName.trim(),
        availability: new Array(weeks.length).fill(false)
      };

      await set(ref(db, `participants/${newParticipant.id}`), newParticipant);
      setNewParticipantName('');
    } catch (error) {
      console.error('Error adding participant:', error);
      setError('Failed to add participant. Please try again.');
    }
  };

  const removeParticipant = async (participantId) => {
    try {
      await remove(ref(db, `participants/${participantId}`));
    } catch (error) {
      console.error('Error removing participant:', error);
      setError('Failed to remove participant. Please try again.');
    }
  };

  const startEditingWeek = (week) => {
    setEditingWeekId(week.id);
    setEditingLabel(week.label);
  };

  const saveWeekLabel = async () => {
    if (!editingLabel.trim()) return;

    try {
      const updatedWeeks = weeks.map(week => 
        week.id === editingWeekId 
          ? { ...week, label: editingLabel.trim() }
          : week
      );

      await set(ref(db, 'weeks'), updatedWeeks);
      setEditingWeekId(null);
      setEditingLabel('');
    } catch (error) {
      console.error('Error updating week label:', error);
      setError('Failed to update week label. Please try again.');
    }
  };

  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This cannot be undone.')) return;

    try {
      const defaultWeeks = [
        { id: 1, label: 'Jan 15-21' },
        { id: 2, label: 'Jan 22-28' },
        { id: 3, label: 'Jan 29-Feb 4' },
        { id: 4, label: 'Feb 5-11' }
      ];

      await set(ref(db, 'weeks'), defaultWeeks);
      await set(ref(db, 'participants'), null);
    } catch (error) {
      console.error('Error clearing data:', error);
      setError('Failed to clear data. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addParticipant();
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Weekly Availability Poll</h2>
          <button
            onClick={clearAllData}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Clear All Data
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 border-b border-red-100">
          {error}
        </div>
      )}

      <div className="p-6">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              className="border rounded px-3 py-2 flex-grow"
            />
            <button
              onClick={addParticipant}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Participant
            </button>
          </div>
        </div>

        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50">Participant</th>
                  {weeks.map(week => (
                    <th key={week.id} className="border p-2 bg-gray-50">
                      {editingWeekId === week.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            className="w-full px-1 py-0.5 border rounded"
                            onKeyPress={(e) => e.key === 'Enter' && saveWeekLabel()}
                            autoFocus
                          />
                          <button
                            onClick={saveWeekLabel}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => startEditingWeek(week)}
                        >
                          {week.label}
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="border p-2 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
                  <tr key={participant.id}>
                    <td className="border p-2">{participant.name}</td>
                    {participant.availability.map((isAvailable, weekIndex) => (
                      <td
                        key={weekIndex}
                        className="border p-2 text-center cursor-pointer"
                        onClick={() => toggleAvailability(participant.id, weekIndex)}
                      >
                        <div
                          className={`w-6 h-6 mx-auto rounded-full ${
                            isAvailable ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No participants yet. Add yourself to get started!
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>Click on the circles to toggle availability for each week</p>
          <p>Click on week labels to edit them</p>
          <p>Changes are automatically saved and synced across all users</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAvailabilityPoll;
