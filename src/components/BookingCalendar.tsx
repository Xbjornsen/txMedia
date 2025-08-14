import { useState, useEffect } from 'react';

interface BookingCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
  onDateSelect: (date: string) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isAvailable: boolean;
  isSelected: boolean;
}

export default function BookingCalendar({ isOpen, onClose, serviceType, onDateSelect }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Mock unavailable dates (in real app, this would come from API)
  const unavailableDates = [
    '2024-08-20', '2024-08-25', '2024-09-15', '2024-09-22'
  ];

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isAvailable: false,
        isSelected: false
      });
    }

    // Add current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isUnavailable = unavailableDates.includes(dateString);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isAvailable: !isPast && !isUnavailable && !isWeekend,
        isSelected: selectedDate?.getTime() === date.getTime()
      });
    }

    // Add next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isAvailable: false,
        isSelected: false
      });
    }

    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (!day.isAvailable) return;
    
    setSelectedDate(day.date);
    const dateString = day.date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    onDateSelect(dateString);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[var(--background)] rounded-xl p-6 w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Book {serviceType}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-[var(--gradient-start)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-medium text-[var(--foreground)]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-[var(--gradient-start)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-[var(--secondary)]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day)}
              disabled={!day.isAvailable}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 min-h-[40px] flex items-center justify-center
                ${!day.isCurrentMonth ? 'text-[var(--secondary)]/30' : ''}
                ${day.isToday ? 'ring-2 ring-[var(--accent)]' : ''}
                ${day.isSelected ? 'bg-[var(--accent)] text-[var(--background)]' : ''}
                ${day.isAvailable && !day.isSelected ? 'hover:bg-[var(--gradient-start)] text-[var(--foreground)]' : ''}
                ${!day.isAvailable ? 'text-[var(--secondary)]/50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-[var(--secondary)] mb-6">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[var(--accent)] rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[var(--secondary)]/30 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {selectedDate && (
          <div className="text-center mb-4 p-3 bg-[var(--gradient-start)] rounded-lg">
            <p className="text-sm text-[var(--secondary)]">Selected Date:</p>
            <p className="font-medium text-[var(--foreground)]">
              {selectedDate.toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[var(--secondary)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Date
          </button>
        </div>
      </div>
    </div>
  );
}