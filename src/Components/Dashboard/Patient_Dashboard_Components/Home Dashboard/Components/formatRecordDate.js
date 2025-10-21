const formatRecordDate = (dateString) => {
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffMs = now - createdDate; // difference in milliseconds
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30.44); // average month length
  const diffYears = Math.floor(diffDays / 365.25);

  if (diffHours < 24) {
    return "New";
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 30) {
    // handle weeks instead of showing 0 months
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  }
};
export default formatRecordDate;


const formatFullDateTime = (dateString) => {
  const date = new Date(dateString);

  // Day with suffix
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  // Month short name
  const months = [
    "Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
    "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
  ];
  const month = months[date.getMonth()];

  // Year
  const year = date.getFullYear();

  // Time (12-hour with AM/PM)
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert to 12-hour format

  return `${day}${suffix}, ${month} ${year} / ${hours}:${minutes} ${ampm}`;
};

export { formatFullDateTime };


const truncateWords = (text, maxWords) => {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export { truncateWords };
