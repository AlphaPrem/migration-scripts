import { writeFileSync } from "fs";
import { questionnaires } from "../data/questionnaire";

function main() {
  const updated = [];
  for (const data of questionnaires) {
    const updatedData = {
      ...data,
      goals: data.goals?.split(","),
      foodAllergies: data.foodAllergies?.split(","),
      exerciseTypeV3: data.exerciseTypeV3?.split(","),
      foodSensitivity: data.foodSensitivity?.split(","),
      otherSupplements: data.otherSupplements?.split(","),
      petsAtHome: data.petsAtHome?.split(","),
    };
    updated.push(updatedData);
  }
  writeFileSync(
    "./data/updated_questionnaires.json",
    JSON.stringify(updated, null, 2)
  );
}

main();
