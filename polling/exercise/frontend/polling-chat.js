const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };
  allChat.push(data);

  const options = {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    method: "POST",
    body: data,
  };

  try {
    await fetch("/poll");
  } catch (error) {
    console.error(error);
    allChat.pop();
  }

  render();
}

async function getNewMsgs() {
  try {
    const res = await fetch("/poll", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "GET",
    });
    allChat = await res.json();
  } catch (error) {
    console.error(error);
  }
  render();
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeToMakeNextRequest = 0;
let start = Date.now();
let prevSecond = 0;
const rafTimer = async () => {
  const elapsedMilliseconds = Date.now() - start;
  const seconds = Math.floor(elapsedMilliseconds / 1000);
  if (seconds > prevSecond) {
    console.log(
      `Counting: seconds elapsed = ${Math.floor(elapsedMilliseconds / 1000)}`
    );
    prevSecond = seconds;
  }
  if (timeToMakeNextRequest <= elapsedMilliseconds) {
    await getNewMsgs();
    timeToMakeNextRequest = elapsedMilliseconds + INTERVAL;
    console.log(
      `Polling:seconds elapsed = ${Math.floor(elapsedMilliseconds / 1000)}`
    );
  }
  requestAnimationFrame(rafTimer);
};

requestAnimationFrame(rafTimer);
