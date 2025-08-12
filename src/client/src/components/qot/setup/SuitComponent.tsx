import { Suit, Value } from "games/qot/types";
import { CardComponent } from "../general/CardComponent";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "client/app/store";
import { addCard } from "../../../../features/qot/setupCardsQot";
import { useEffect } from "react";

interface Props {
  suit: Suit;
}

export const SuitComponent = ({ suit }: Props) => {
  /* select player's hand from redux */
  // const hand = useAppSelector((state) => state.hand)
  const hand = useSelector(
    (state: RootState) => state.setupCardsQot.hand
  );

  const dispatch = useDispatch();


  function handleSelectCard(rank: Value, suit: Suit) {
    const card = { rank: rank, suit: suit }
    console.log("Selected card: ", card)
    dispatch(addCard(card))
    console.log("My hand: ", hand)
  }

  return (
    <div className="w-1 mx-auto">
      <div>{suit}</div>
      {/* <CardComponent card={{ rank: 1, suit: suit }} /> */}
      <div id={suit} className="flex flex-wrap gap-2">
        {Array.from({ length: 13 }, (_, i) => (
          <div
            key={i}
            onClick={() => handleSelectCard((i + 1) as Value, suit)}
            className="flex items-center gap-2"
          >
            <CardComponent card={{ rank: (i + 1) as Value, suit: suit }} />
          </div>
        ))}
      </div>
    </div>
  );
};
