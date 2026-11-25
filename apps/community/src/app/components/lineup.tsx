import { directory, type Roster } from "../model/scheduling";

export function Lineup({ roster }: { roster: Roster }) {
  return (
    <ul className="lineup">
      {roster.duties.map((duty) => (
        <li key={duty.id}>
          <strong>{duty.role}</strong>
          <span>{directory[duty.member]}</span>
        </li>
      ))}
    </ul>
  );
}
