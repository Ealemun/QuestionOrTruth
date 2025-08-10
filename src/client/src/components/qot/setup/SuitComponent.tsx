import { Suit, Value } from "games/qot/types";
import { CardComponent } from "../general/CardComponent";

interface Props {
  suit: Suit;
}

export const SuitComponent = ({ suit }: Props) => {
  /* select player's hand from redux */
  // const hand = useAppSelector((state) => state.hand)

  return (
    <div className="flex">
      <div>{suit}</div>
      {/* <CardComponent card={{ rank: 1, suit: suit }} /> */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 13 }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <CardComponent card={{ rank: i + 1 as Value, suit: suit }} />
          </div>
        ))}
      </div>
    </div>
  );
};
