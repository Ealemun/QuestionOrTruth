import { useState } from "react";
import { CardComponent } from "./CardComponent";
import { Value } from "games/qot/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "client/app/store";

export const Hand = () => {
  const hand = useSelector(
    (state: RootState) => state.setupCardsQot.hand
  );
  const dispatch = useDispatch();
  // Initialise les 8 cellules avec du texte vide
  const [cells, setCells] = useState(Array(8).fill(""));

  // Gère le changement de contenu d'une cellule
  const handleChange = (index: number, value: string) => {
    const newCells = [...cells];
    newCells[index] = value;
    setCells(newCells);
  };

  return (
    <div className="w-1 mx-auto">
      <table>
        <tbody>
          <tr>
            {cells.map((cell, index) => (
              <td key={index}>
                { hand[index] ?
                <CardComponent
                  card= {hand[index]}
                />:
                <div>prout</div>
                
}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
