import { useState } from "react";
import { CardComponent } from "./CardComponent";
import { Value } from "games/qot/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "client/app/store";
import { removeCard } from "../../../../features/qot/setupCardsQot";

export const Hand = () => {
  const hand = useSelector((state: RootState) => state.setupCardsQot.hand);
  const dispatch = useDispatch();
  // Initialise les 8 cellules avec du texte vide
  const [cells, setCells] = useState(Array(8).fill(""));


  return (
    <div className="w-1 mx-auto">
      <table>
        <tbody>
          <tr>
            {cells.map((cell, index) => (
              <td key={index}>
                {hand[index] ? (
                  <div 
                  onClick={() => dispatch(removeCard(index))} 
                  className="cursor-pointer">
                    <CardComponent card={hand[index]} />
                  </div>
                ) : (
                  <div>prout</div>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
