function getCurrentDate() {
  const date = new Date();
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export { getCurrentDate };
