'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale
alert(
  'Use username: js and password: 1111 for account 1 || Use username: jd and password: 2222 for account 2 '
);

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
let sorted = false;
let currentAccount, timer;
let labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (val, i) {
    let finalDate;
    const type = val > 0 ? 'deposit' : 'withdrawal';
    const [date, time] = acc.movementsDates[i].split('T');
    const days = daysPassed(new Date(), new Date(date));

    if (days <= 1) finalDate = 'Today';
    else if (days === 2) finalDate = 'Yesterday';
    else if (days <= 7) finalDate = `${days} days ago`;
    else finalDate = date.split('-').reverse().join('/');

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${finalDate}</div>
          <div class="movements__value">${val}€</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const calcBalance = function (movements) {
  const balance = movements.reduce(function (acc, val, i) {
    return (acc += val);
  }, 0);
  labelBalance.textContent = `${balance}€`;
};

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (name) {
        return name[0];
      })
      .join('');
  });
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const displaySummary = function (movements, interestRate) {
  const incomes = movements
    .filter(val => val > 0)
    .reduce((acc, val) => acc + val);
  const withdrawals = movements
    .filter(val => val < 0)
    .reduce((acc, val) => acc + val);
  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (interestRate / 100))
    .filter(val => val > 1)
    .reduce((acc, val) => acc + val);

  labelSumIn.textContent = `${Math.trunc(incomes)}€`;
  labelSumOut.textContent = `${Math.trunc(Math.abs(withdrawals))}€`;
  labelSumInterest.textContent = `${Math.trunc(interest)}€`;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUI = function (acc) {
  calcBalance(acc.movements);
  displayMovements(acc);
  displaySummary(acc.movements, acc.interestRate);
  displayDate();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
btnLogin.addEventListener('click', function (event) {
  event.preventDefault();

  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  createUsername(accounts);
  const userID = inputLoginUsername.value;
  const userPin = inputLoginPin.value;

  currentAccount = accounts.find(acc => acc.username === userID);

  const [firstName, lastName] = currentAccount.owner.split(' ');
  const correctPin = currentAccount.pin;
  if (+userPin === correctPin) {
    inputLoginUsername.value = inputLoginPin.value = '';
    labelWelcome.textContent = `Welcome back, ${firstName}`;
    updateUI(currentAccount);
    containerApp.style.opacity = '100';
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();

  const currentBalance = +labelBalance.textContent.slice(0, -1);
  const transferAmt = inputTransferAmount.value;
  const transferAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  currentAccount.movementsDates.push(
    `${new Date().toLocaleDateString('sv')}T${new Date().toLocaleTimeString(
      'sv'
    )}`
  );
  transferAccount.movementsDates.push(
    `${new Date().toLocaleDateString('sv')}T${new Date().toLocaleTimeString(
      'sv'
    )}`
  );
  if (
    transferAmt > 0 &&
    currentBalance >= transferAmt &&
    transferAccount?.username !== currentAccount.username
  ) {
    inputTransferAmount.value = inputTransferTo.value = '';
    transferAccount.movements.push(+transferAmt);
    currentAccount.movements.push(+(-1 * transferAmt));
    clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  } else inputTransferAmount.value = inputTransferTo.value = '';
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  const closeUser = String(inputCloseUsername.value);
  const closePin = +inputClosePin.value;

  if (
    closeUser === currentAccount.username &&
    closePin === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc.username === closeUser);
    accounts.splice(index, 1);
    containerApp.style.opacity = '0';
  } else inputCloseUsername.value = inputClosePin.value = '';
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const loanAmt = +inputLoanAmount.value;
  const anyDeposit = currentAccount.movements.some(mov => mov >= 0.1 * loanAmt);

  setTimeout(function () {
    if (anyDeposit === true && loanAmt > 0) {
      currentAccount.movements.push(loanAmt);
      currentAccount.movementsDates.push(
        `${new Date().toLocaleDateString('sv')}T${new Date().toLocaleTimeString(
          'sv'
        )}`
      );
    }
    inputLoanAmount.value = '';

    clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }, 3000);
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
btnSort.addEventListener('click', function (event) {
  event.preventDefault();

  if (sorted === false) {
    displayMovements(currentAccount, true);
    sorted = true;
  } else if (sorted === true) {
    displayMovements(currentAccount, false);
    sorted = false;
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const displayDate = function () {
  const currentDate = new Date();
  const [day, month, year, hour, min] = [
    `${currentDate.getDate()}`.padStart(2, '0'),
    `${currentDate.getMonth() + 1}`.padStart(2, '0'),
    currentDate.getFullYear(),
    `${currentDate.getHours()}`.padStart(2, '0'),
    `${currentDate.getMinutes()}`.padStart(2, '0'),
  ];
  const now = `${day}/${month}/${year} ${hour}:${min}`;
  labelDate.textContent = now;
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const daysPassed = function (date1, date2) {
  const timeStamp = Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  return timeStamp;
};

console.log(daysPassed(new Date(), new Date('2022-09-02T00:34:59')));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  let time = 120;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};
