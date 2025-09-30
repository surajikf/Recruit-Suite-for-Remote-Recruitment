import { useState } from 'react';

export default function RemindersDropdown() {
  const [open, setOpen] = useState(false);
  const reminders = [
    { id: 1, text: 'Follow up with shortlisted candidates' },
    { id: 2, text: 'Review new job applications' },
  ];
  return (
    <div className="relative">
      <button
        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Reminders
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50" role="menu">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2">Today</div>
            <ul className="space-y-2">
              {reminders.map(r => (
                <li key={r.id} className="text-sm text-gray-700">
                  • {r.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}


