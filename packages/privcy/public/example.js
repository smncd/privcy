const el = document.querySelector('#script-element');

let count = 0;

setInterval(() => {
  count += 1;
  el.innerHTML = `Script loaded! :) (${count})`;
}, 1000);
