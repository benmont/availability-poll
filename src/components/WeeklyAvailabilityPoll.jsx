import React, { useState, useEffect } from 'react';

const WeeklyAvailabilityPoll = () => {
  // Initialize state from localStorage or use defaults
  const [weeks, setWeeks] = useState(() => {
    const savedWeeks = localStorage.getItem('availabilityPollWeeks');
    return savedWeeks ? JSON.parse(savedWeeks) : [
      { id: 1, label: 'Jan 15-21' },
      { id: 2, label: 'Jan 22-28' },
      { id: 3, label: 'Jan 29-Feb 4' },
      { id: 4, label: 'Feb 5-11' }
    ];
  });
  
  const [participants, setParticipants] = useState(() => {
    const savedParticipants = localStorage.getItem('availabilityPollParticipants');
    return savedParticipants ? JSON.parse(savedParticipants) : [
      { id: 1, name: 'You', availability: new Array(4).fill(false) }
    ];
  });
  
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingWeekId, setEditingWeekId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('availabilityPollWeeks', JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem('availabilityPollParticipants', JSON.stringify(participants));
  }, [participants]);

  const toggleAvailability = (participantId, weekIndex) => {
    setParticipants(participants.map(participant => {
      if (participant.id === participantId) {
        const newAvailability = [...participant.availability];
        newAvailability[weekIndex] = !newAvailability[weekIndex];
        return { ...participant, availability: newAvailability };
      }
      return participant;
    }));
  };

  const addParticipant = () => {
    if (newParticipantName.trim()) {
      setParticipants([
        ...participants,
        {
          id: participants.length + 1,
          name: newParticipantName.trim(),
          availability: new Array(weeks.length).fill(false)
        }
      ]);
      setNewParticipantName('');
    }
  };

  const removeParticipant = (participantId) => {
    setParticipants(participants.filter(p => p.id !== participantId));
  };

  const startEditingWeek = (week) => {
    setEditingWeekId(week.id);
    setEditingLabel(week.label);
  };

  const saveWeekLabel = () => {
    if (editingLabel.trim()) {
      setWeeks(weeks.map(week => 
        week.id === editingWeekId 
          ? { ...week, label: editingLabel.trim() }
          : week
      ));
    }
    setEditingWeekId(null);
    setEditingLabel('');
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('availabilityPollWeeks');
      localStorage.removeItem('availabilityPollParticipants');
      setWeeks([
        { id: 1, label: 'Jan 15-21' },
        { id: 2, label: 'Jan 22-28' },
        { id: 3, label: 'Jan 29-Feb 4' },
        { id: 4, label: 'Feb 5-11' }
      ]);
      setParticipants([
        { id: 1, name: 'You', availability: new Array(4).fill(false) }
      ]);
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
      <div className="p-6">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Enter participant name"
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
                    {participant.id !== 1 && (
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Click on the circles to toggle availability for each week</p>
          <p>Click on week labels to edit them</p>
          <p>All changes are automatically saved</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAvailabilityPoll;
