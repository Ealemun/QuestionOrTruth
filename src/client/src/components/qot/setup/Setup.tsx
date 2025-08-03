import { Hand } from "../general/Hand";
import { SuitComponent } from "./SuitComponent";
import { ValidateHandButton } from "./ValidateHandButton";

export const Setup = () => {
    console.log("setup loaded")

  return (
    <div className="flex flex-col">
      <SuitComponent suit={"spades"}/>
      <SuitComponent suit={"hearts"}/>
      <SuitComponent suit={"diamonds"}/>
      <SuitComponent suit={"clubs"}/>

      <div className="flex">
        <Hand />
        <ValidateHandButton />
      </div>
    </div>
  );
};
