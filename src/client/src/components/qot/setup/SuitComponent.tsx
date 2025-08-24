import { Suit, Value } from "games/qot/types";
import { CardComponent } from "../general/CardComponent";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "client/app/store";
import { addCard } from "../../../../features/qot/setupCardsQot";

interface Props {
  suit: Suit;
}

export const SuitComponent = ({ suit }: Props) => {
  const availableCards = useSelector(
    (state: RootState) => state.setupCardsQot.availableCards
  )

  const dispatch = useDispatch();


  function handleSelectCard(rank: Value, suit: Suit) {
    const card = { rank: rank, suit: suit }
    dispatch(addCard(card))
  }

  function cardStyle(rank: Value, suit: Suit){
    switch (availableCards[suit][rank]) {
      case 0:
        return "cursor-pointer hover:opacity-50"
      case 1:
        return "opacity-50 grayscale cursor-not-allowed"
      case 2:
        return "cursor-pointer opacity-50 grayscale border border-sky-300 hover:opacity-100 hover:grayscale-0"
    }
  }

  return (
    <div className="w-1 mx-auto">
      <div>{suit}</div>
      {/* <CardComponent card={{ rank: 1, suit: suit }} /> */}
      <div id={suit} className="flex flex-wrap gap-4">
        {Array.from({ length: 13 }, (_, i) => (
          <div
            key={i}
            onClick={() => handleSelectCard((i + 1) as Value, suit)}
            className={cardStyle((i + 1) as Value, suit)} //flex items-center gap-2 opacity-50 grayscale pointer-events-none cursor-not-allowed"
          >
            <CardComponent card={{ rank: (i + 1) as Value, suit: suit }} />
          </div>
        ))}
      </div>
    </div>
  );
};
