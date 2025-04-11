const startPolling = (endpoint, delay, callback) => {
  const intervalId = setInterval(() => {
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        callback(data, intervalId);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, delay);
};

const doSomething = (data, intervalId) => {
  console.log('Data received:', data);
  // Refreshing your elements or updating the UI goes here
  if (shouldStopPolling(data)) {
    clearInterval(intervalId);
  }
};
