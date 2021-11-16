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
  allChat.unshift(data);

  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    await fetch("/poll", options);
  } catch (error) {
    console.error(error);
    allChat.pop();
  }

  render();
}

async function getNewMsgs() {
  let json;
  try {
    const res = await fetch("/poll");
    json = await res.json();
  } catch (e) {
    // back off
    console.error("polling error", e);
  }
  allChat = json.msg;
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
const rafTimer = async () => {
  const elapsedMilliseconds = Date.now() - start;
  if (timeToMakeNextRequest <= elapsedMilliseconds) {
    await getNewMsgs();
    timeToMakeNextRequest = elapsedMilliseconds + INTERVAL;
  }
  requestAnimationFrame(rafTimer);
};

requestAnimationFrame(rafTimer);
