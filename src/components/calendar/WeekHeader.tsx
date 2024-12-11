const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const WeekHeader = () => {
  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS_OF_WEEK.map((day) => (
        <div key={day} className="text-center font-semibold text-sm p-2">
          {day}
        </div>
      ))}
    </div>
  );
};