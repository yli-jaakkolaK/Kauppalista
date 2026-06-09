const input = document.querySelector('.add-item input');
const button = document.querySelector('.add-item button');
const list = document.querySelector('.list');

button.addEventListener('click', function () {
  const text = input.value.trim();

  if (text === '') return;

  const item = document.createElement('li');
  item.textContent = text;

  item.addEventListener('click', function () {
    item.classList.toggle('done');
  });

  list.appendChild(item);
  input.value = '';
  input.focus();
});

input.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    button.click();
  }
});
