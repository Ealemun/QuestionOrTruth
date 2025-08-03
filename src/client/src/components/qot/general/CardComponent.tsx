import { Card } from "games/qot/types"

interface Props {
    card: Card,
    disabled?: boolean  // true if the card must be greyed out (already selected in the player's hand)
}

export const CardComponent = ({card, disabled}: Props) => {

    // select gamephase from redux -> if != setup make the component non clickable
    return (
    <div className="w-[300px] h-[100px] border-2 border-black">
        <div className="flex flex-col">
            <div>{card.suit}</div>
            <div>{card.rank}</div>
        </div>
    </div>
    )
}