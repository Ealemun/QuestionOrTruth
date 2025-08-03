import { Suit } from "games/qot/types"
import { CardComponent } from "../general/CardComponent"

interface Props {
    suit: Suit
}

export const SuitComponent = ({suit}: Props) => {

    /* select player's hand from redux */
    // const hand = useAppSelector((state) => state.hand)


    return (
        <div className="flex">
            <div>{suit}</div>
            <CardComponent card={{rank: 1, suit: suit}}/>
        </div>
    )
}