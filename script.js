const JD_EPOCH_OFFSET_AMETE_ALEM = -285019; // ዓ/ዓ
const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856; // ዓ/ም
const JD_EPOCH_OFFSET_GREGORIAN = 1721426;
const eventDetails = {
  1: "5:00am - 8:00am ስብሐተ ነግህ\n\n5:30pm - 8:00pm ጸሎተ ሠርክ",
  2: "5:00am - 8:00am ስብሐተ ነግህ\n12:00pm - 3:30pm ጸሎተ ቅዳሴ\n5:30pm - 8:00pm ጸሎተ ሠርክ",
  3: "4:00am - 10:00am ስብሐተ ነግህ ወጸሎተ ቅዳሴ\n",
  4: "12:00am - 12:00pm ሥርዓተ ማኅሌት ወጸሎተ ቅዳሴ",
  5: "5:00am - 8:00am ስብሐተ ነግህ\n12:00pm - 3:30pm ጸሎተ ቅዳሴ\n5:30pm - 8:00pm ጸሎተ ሠርክ",
  // Add more event details as needed
};

const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
day = date.getDate(),
currYear = date.getFullYear(),
currMonth = date.getMonth() + 1;
let EthiopianDate = gregorianToEthiopic(currYear, currMonth, day);

let zareday = EthiopianDate.day;
currYear = EthiopianDate.year;
currMonth = EthiopianDate.month;

// storing full name of all months in array
const months = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

const renderCalendar = () => {
    let firstDayofMonth = getFirstDayOfMonthEthiopian(currMonth, currYear); //(0 for Sunday, 1 for Monday, ..., 6 for Saturday)
    let lastDateofMonth = getLastDayOfMonthEthiopian(currMonth, currYear);
    let lastDayofMonth = getLastDayOfMonthEthiopian(currMonth, currYear); 
    let lastDateofLastMonth = getLastDateOfLastEthiopianMonth(currMonth, currYear);
    let liTag = "";
    let CurrentEthiopianDate = getCurrentEthiopianDate( );

    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
      liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday = i === CurrentEthiopianDate.day && currMonth === CurrentEthiopianDate.month
                     && currYear === CurrentEthiopianDate.year ? "active" : "";

        let isSenbet = (ethiopianDayOfWeek(currYear, currMonth, i) == 'Sunday' || ethiopianDayOfWeek(currYear, currMonth, i) == 'Saturday') ? 'sunday' : ''; // Check if it's Sunday
            //cell.innerHTML = `<li class="calendar-cell ${isToday} ${isSunday}" onclick="showPopup(${i})">${i}</li>`;
        liTag += `<li class="${isToday}  ${isSenbet}"  onclick="showPopup(${i}, ${currMonth}, ${currYear})">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
      liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }

  currentDate.innerText = `${months[currMonth-1]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;
}
renderCalendar();

prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        if( icon.id === "prev" && currMonth == 1 )
        {
          currMonth = 13;
          currYear = currYear - 1;
        }
        else if(icon.id === "next" && currMonth == 13) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            currMonth = 1;
            currYear = currYear + 1;
        } else {
          currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
          //date = new Date(); // pass the current date as date value
        }
        renderCalendar(); // calling renderCalendar function
    });
});

/**
 * This is JavaScript implementation of Beyene-Kudlek algorithm.
 *
 * For more info have a look at: http://www.geez.org/Calendars/
 * Java Code at https://github.com/geezorg/geezorg.github.io/blob/master/Calendars/EthiopicCalendar.java
 */


function mod(i, j) {
  return (i - (j * Math.floor(i / j)));
}

/**
 * guesses ERA from JDN
 *
 * @param  {Number} jdn
 * @return {Number}
 */
function guessEra(jdn, JD_AM = JD_EPOCH_OFFSET_AMETE_MIHRET, JD_AA = JD_EPOCH_OFFSET_AMETE_ALEM) {
  return (jdn >= (JD_AM + 365)) ? JD_AM : JD_AA;
}

/**
 * given year, month and day of Gregorian returns JDN
 *
 * @param  {Number} year
 * @param  {Number} month
 * @param  {Number} day
 * @param  {Number} JD_OFFSET
 * @return {Number}
 */
function gregorianToJDN(year = 1, month = 1, day = 1, JD_OFFSET = JD_EPOCH_OFFSET_GREGORIAN) {
  const s = Math.floor(year / 4)
          - Math.floor((year - 1) / 4)
          - Math.floor(year / 100)
          + Math.floor((year - 1) / 100)
          + Math.floor(year / 400)
          - Math.floor((year - 1) / 400);
  const t = Math.floor((14 - month) / 12);
  const n = 31 * t * (month - 1)
          + (1 - t) * (59 + s + 30 * (month - 3) + Math.floor((3 * month - 7) / 5))
          + day - 1;
  const j = JD_OFFSET
          + 365 * (year - 1)
          + Math.floor((year - 1) / 4)
          - Math.floor((year - 1) / 100)
          + Math.floor((year - 1) / 400)
          + n;

  return j;
}

/**
 * given a JDN and an era returns the Ethiopic equivalent
 *
 * @param  {Number} jdn
 * @param  {Number} era
 * @return {Object} { year, month, day }
 */
function jdnToEthiopic(jdn, era = JD_EPOCH_OFFSET_AMETE_MIHRET) {
  const r = mod((jdn - era), 1461);
  const n = mod(r, 365) + 365 * Math.floor(r / 1460);

  const year = 4 * Math.floor((jdn - era) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = mod(n, 30) + 1;

  return { year, month, day };
}

 function gregorianToEthiopic(year = 1, month = 1, day = 1) {
  const jdn = gregorianToJDN(year, month, day);
  return jdnToEthiopic(jdn, guessEra(jdn));
}

// Function to determine the number of days in each Ethiopian month
function getDaysInMonth(month, year) {
  if (month === 13) { // Pagumae
    return isLeapYear(year) ? 6 : 5;
  } else {
    return 30;
  }
}

// Function to check if the given Ethiopian year is a leap year
function isLeapYear(year) {
  // Ethiopian leap years occur every 4 years, but not every 100 years, except every 400 years
  return (year + 1) % 4 === 0 && ((year + 1) % 100 !== 0 || (year + 1) % 400 === 0);
}

function getFirstDayOfMonthEthiopian(month, year) {
  
  let firstDayOfMonthCorrespondingGregorianDate = ethiopicToGregorian(year, month, 1);
  
let firstDayOfMonthCorrespondingGregorianday = firstDayOfMonthCorrespondingGregorianDate.day,
firstDayOfMonthCorrespondingGregorianmonth = firstDayOfMonthCorrespondingGregorianDate.month,
firstDayOfMonthCorrespondingGregorianyear = firstDayOfMonthCorrespondingGregorianDate.year;

var date = new Date(firstDayOfMonthCorrespondingGregorianyear, firstDayOfMonthCorrespondingGregorianmonth - 1, firstDayOfMonthCorrespondingGregorianday); // Note: Months are zero-based, so 1 represents February

// Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
var dayOfWeek = date.getDay();
return dayOfWeek;
}

function isLeapYearEthiopian(year) {
  // Ethiopian leap years occur every 4 years, but not every 100 years, except every 400 years
  return (year + 1) % 4 === 0 && ((year + 1) % 100 !== 0 || (year + 1) % 400 === 0);
}

function getDaysUntilMonth(month, year) {
  // Ethiopian months names and days counts for each month
  const ethiopianDays = [
      30, // Meskerem
      30, // Tikimt
      30, // Hidar
      30, // Tahsas
      30, // Tir
      30, // Yekatit
      30, // Megabit
      30, // Miazia
      30, // Genbot
      30, // Sene
      30, // Hamle
      30, // Nehase
      // Pagumae is either 5 or 6 days, handled separately
  ];
  
  let days = 0;
  for (let i = 0; i < month - 1; i++) {
      days += ethiopianDays[i];
  }
  return days;
}


function getLastDayOfMonthEthiopian(month, year) {
  // Ethiopian days counts for each month
  const ethiopianDays = [
      30, // Meskerem
      30, // Tikimt
      30, // Hidar
      30, // Tahsas
      30, // Tir
      30, // Yekatit
      30, // Megabit
      30, // Miazia
      30, // Genbot
      30, // Sene
      30, // Hamle
      30, // Nehase
      // Pagumae is either 5 or 6 days, handled separately
  ];

  if (month === 13) { // Pagumae
      return isLeapYearEthiopian(year) ? 6 : 5;
  } else {
      return ethiopianDays[month - 1];
  }
}

function isLeapYearEthiopian(year) {
  // Ethiopian leap years occur every 4 years, but not every 100 years, except every 400 years
  return (year + 1) % 4 === 0 && ((year + 1) % 100 !== 0 || (year + 1) % 400 === 0);
}

function getLastDayOfMonthEthiopian(month, year) {
  // Ethiopian days counts for each month
  const ethiopianDays = [
      30, // Meskerem
      30, // Tikimt
      30, // Hidar
      30, // Tahsas
      30, // Tir
      30, // Yekatit
      30, // Megabit
      30, // Miazia
      30, // Genbot
      30, // Sene
      30, // Hamle
      30, // Nehase
      // Pagumae is either 5 or 6 days, handled separately
  ];

  // Pagumae is handled separately because it could have 5 or 6 days depending on leap year
  if (month === 13) {
      return isLeapYearEthiopian(year) ? 6 : 5;
  } else {
      return ethiopianDays[month - 1];
  }
}

function isLeapYearEthiopian(year) {
  // Ethiopian leap years occur every 4 years, but not every 100 years, except every 400 years
  return (year + 1) % 4 === 0 && ((year + 1) % 100 !== 0 || (year + 1) % 400 === 0);
}

// Example usage
const month = 2; // For example, Tikimt
const year = 2014; // Ethiopian year

console.log(getLastDayOfMonthEthiopian(month, year)); // Output will be the last day of the month

function getLastDateOfLastEthiopianMonth(currentMonth, currentYear) {
  // Adjust month and year for the previous month
  let previousMonth = currentMonth - 1;
  let previousYear = currentYear;
  if (previousMonth < 1) {
      previousMonth = 13; // Adjust to Pagumae (the last month)
      previousYear--; // Adjust the year for the previous month
  }
  
  // Get the last day of the previous month
  return getLastDayOfMonthEthiopian(previousMonth, previousYear);
}

// Function to get the last day of the month in the Ethiopian calendar
function getLastDayOfMonthEthiopian(month, year) {
  const ethiopianDays = [
      30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, // 12 months
  ];

  // Handle Pagumae separately (5 or 6 days depending on leap year)
  if (month === 13) {
      return isLeapYearEthiopian(year) ? 6 : 5;
  } else {
      return ethiopianDays[month - 1];
  }
}

// Function to check if a year is a leap year in the Ethiopian calendar
function isLeapYearEthiopian(year) {
  return (year + 1) % 4 === 0 && ((year + 1) % 100 !== 0 || (year + 1) % 400 === 0);
}

// Example usage
/* const currentMonth = 3; // For example, Hidar (assuming it's the current month)
const currentYear = 2014; // Ethiopian year

console.log(getLastDateOfLastEthiopianMonth(currentMonth, currentYear)); // Output will be the last date of the previous month
 */

function getCurrentEthiopianDate() {
  let dateLocalVariable = new Date(),
dayLocalVariable = dateLocalVariable.getDate(),
currYearLocalVariable = dateLocalVariable.getFullYear(),
currMonthLocalVariable = dateLocalVariable.getMonth() + 1;
let EthiopianDateLocalVariable = gregorianToEthiopic(currYearLocalVariable, currMonthLocalVariable, dayLocalVariable);

  return {
      year: EthiopianDateLocalVariable.year,
      month: EthiopianDateLocalVariable.month,
      day: EthiopianDateLocalVariable.day
  };
}

function getLastDateOfLastEthiopianMonth() {
  // Get current Gregorian date
  const currentDate = new Date();

  // Calculate Ethiopian date for the previous month
  let ethiopianYear = currentDate.getFullYear() - 8;
  let ethiopianMonth = currentDate.getMonth();

  // Adjust year and month if the current month is Meskerem (Ethiopian New Year)
  if (ethiopianMonth === 0) {
      ethiopianMonth = 12; // Adjust to Pagumae (the last month of the previous Ethiopian year)
      ethiopianYear--;
  }

  // Get the last day of the previous month
  return getLastDayOfMonthEthiopian(ethiopianMonth, ethiopianYear);
}

    /* // Show pop-up with event details
    async function showPopup(day) {
      const popup = document.getElementById('popup');
      const eventDetails = document.getElementById('eventDetails');
      const eventData = await eventDetailsData();
      let eventData2 = eventData.toString();
      console.log(typeof eventData2);
      //const eventText = eventData.split('\n')[day - 1] || "No event scheduled for this day.";
      const eventDetailsArray = eventData2.split('\n');
      console.log(eventDetailsArray[1]);
      const eventText = eventDetailsArray[day - 1] || "No event scheduled for this day.";
      console.log(day);
  console.log(eventDetailsArray[day - 1]);
      const textContent = `ወር: ${months[currMonth - 1]} \nቀን: ${day}: \n${eventText}`;
      console.log(textContent);
      eventDetails.textContent = textContent;
      popup.style.display = 'block';
  } */

      // Show pop-up with event details
      function showPopup(dayArg, monthArg, yearArg) {
        const popup = document.getElementById('popup');
        const eventDetailsTextArea = document.getElementById('eventDetails');
        const eventText = getEventDetailsData(dayArg, monthArg, yearArg); //|| "No event scheduled for this day.";
        eventDetailsTextArea.value = eventText;
        popup.style.display = 'block';
    }
  // Close pop-up
  function closePopup() {
      const popup = document.getElementById('popup');
      popup.style.display = 'none';
  }

   function getEventDetailsData(dayArg, monthArg, yearArg){
    let eventOfZday = {};
   if(yearArg == 2016 && ethiopianDayOfWeek(yearArg, monthArg, dayArg) == 'Sunday')
   eventOfZday = eventDetails[4];
    return eventOfZday;
  }

  // Event details data function
async function eventDetailsData() {
  const response = await fetch('event_details.txt');
  const data = await response.text();
 // console.log(data);
  const eventDetailsArray = data.split('\n');
  const eventDetails = {};
  eventDetailsArray.forEach((eventDetail, index) => {
      eventDetails[index + 1] = eventDetail.trim(); // Index starts from 1
  });
   //console.log(eventDetails);
  
  return eventDetails;
}

function ethiopianDayOfWeek(year, month, day) {
  let CorrespondingGregorianDate = ethiopicToGregorian(year, month, day);
let gregday = CorrespondingGregorianDate.day;
gregYear = CorrespondingGregorianDate.year;
gregMonth = CorrespondingGregorianDate.month;
// Create a new Date object using the provided year, month, and day
const date = new Date(gregYear, gregMonth - 1, gregday); // Month is 0-based in JavaScript, so we subtract 1

// Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
const dayOfWeek = date.getDay();

// Array of day names
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Return the name of the day of the week
return days[dayOfWeek];

}

/**
 * determines if a Gregorian year is leap year or not
 *
 * @param  {Number}  year
 * @return {Boolean}
 */
function isGregorianLeap(year = 1) {
  return (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));
}

/**
 * converts JDN to Gregorian
 *
 * @param  {Number} jdn
 * @param  {Number} JD_OFFSET
 * @param  {Function} leapYear
 * @return {Number}
 */
function jdnToGregorian(jdn, JD_OFFSET = JD_EPOCH_OFFSET_GREGORIAN, leapYear = isGregorianLeap) {
  const nMonths = 12;
  const monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const r2000 = mod((jdn - JD_OFFSET), 730485);
  const r400 = mod((jdn - JD_OFFSET), 146097);
  const r100 = mod(r400, 36524);
  const r4 = mod(r100, 1461);

  let n = mod(r4, 365) + 365 * Math.floor(r4 / 1460);
  const s = Math.floor(r4 / 1095);

  const aprime = 400 * Math.floor((jdn - JD_OFFSET) / 146097)
               + 100 * Math.floor(r400 / 36524)
               + 4 * Math.floor(r100 / 1461)
               + Math.floor(r4 / 365)
               - Math.floor(r4 / 1460)
               - Math.floor(r2000 / 730484);
  const year = aprime + 1;
  const t = Math.floor((364 + s - n) / 306);
  let month = t * (Math.floor(n / 31) + 1) + (1 - t) * (Math.floor((5 * (n - s) + 13) / 153) + 1);
  n += 1 - Math.floor(r2000 / 730484);
  let day = n;

  if ((r100 === 0) && (n === 0) && (r400 !== 0)) {
    month = 12;
    day = 31;
  } else {
    monthDays[2] = (leapYear(year)) ? 29 : 28;
    for (let i = 1; i <= nMonths; i += 1) {
      if (n <= monthDays[i]) {
        day = n;
        break;
      }

      n -= monthDays[i];
    }
  }

  return { year, month, day };
}

/**
 *  Computes the Julian day number of the given Coptic or Ethiopic date.
 *  This method assumes that the JDN epoch offset has been set. This method
 *  is called by copticToGregorian and ethiopicToGregorian which will set
 *  the jdn offset context.
 *
 *  @param {Number} year year in the Ethiopic calendar
 *  @param {Number} month month in the Ethiopic calendar
 *  @param {Number} day date in the Ethiopic calendar
 *  @param {Number} era [description]
 *
 *  @return {Number} The Julian Day Number (JDN)
 */
function ethCopticToJDN(year, month, day, era) {
  return (era + 365) + 365 * (year - 1) + Math.floor(year / 4) + 30 * month + day - 31;
}

function ethiopicToGregorian(year = 1, month = 1, day = 1, era = JD_EPOCH_OFFSET_AMETE_MIHRET) {
  return jdnToGregorian(ethCopticToJDN(year, month, day, era));
}