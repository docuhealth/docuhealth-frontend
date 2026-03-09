import React from "react";

const DynamicDate = () => {
  // Get the current date
  const currentDate = new Date();

  // Format the date as "Monday 25th, 2024"
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  // Format day with ordinal suffix (e.g., 25th, 3rd, 1st)
  const getOrdinal = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const dayWithOrdinal = getOrdinal(currentDate.getDate());
  const dynamicDate = `${formattedDate.split(" ")[0]} ${dayWithOrdinal}, ${currentDate.getFullYear()}`;

  return <p className="text-gray-500 text-sm">{dynamicDate}</p>;
};

export default DynamicDate;
