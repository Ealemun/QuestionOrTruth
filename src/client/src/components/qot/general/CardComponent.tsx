import { Card } from "games/qot/types"

interface Props {
    card: Card,
    disabled?: boolean  // true if the card must be greyed out (already selected in the player's hand)
}

export const CardComponent = ({card, disabled}: Props) => {
    const path_card = `../graphics/single_cards/${card.suit}-${card.rank}.svg`
    // select gamephase from redux -> if != setup make the component non clickable
    return (
    <div className="w-[70px] m-[5px] border-2 border-black">
        <div className="flex flex-col">
            {/* <div>{card.suit}</div>
            <div>{card.rank}</div> */}
            <img
              src={path_card}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
        </div>
    </div>
    )
}