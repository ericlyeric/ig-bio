require('dotenv').config();
const {IgApiClient} = require('instagram-private-api');
const ig = new IgApiClient();
ig.state.generateDevice(process.env.IG_USERNAME);

const getAgeInDays = (today, birthday) => {
  // 1000ms = 1s, 60s = 1m, 60 mins = 1hr, 24hr = 1day
  const msPerDay = 1000 * 60 * 60 * 24;
  // discard time and timezone
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const birthdayUTC = Date.UTC(birthday.getFullYear(), birthday.getMonth(), birthday.getDate());

  return Math.floor((todayUTC - birthdayUTC) / msPerDay);
}

const calculateAge = () => {
  const today = new Date();
  const birthday = new Date(process.env.BIRTHDAY_ISO_8601);

  const ageInDays = getAgeInDays(today, birthday);
  // 7 days = 1 week
  const ageInWeeks = Math.floor(ageInDays / 7);

  // 1 week = 0.230137 months or 4.34524 weeks = 1 month
  // show weeks until 6 months -> 26.0715 = 6 months
  const ageInMonths = Math.floor(ageInWeeks / 4.34524);
  if (ageInMonths < 6) {
    return `${ageInWeeks}wk`;
  } else {
    // 12 months = 1 year
    const ageInYears = Math.floor(ageInMonths / 12)

    if (ageInYears < 1) {
      return `${ageInMonths}mo`
    } else {
      const ageInMonthsRemainder = ageInMonths % 12;
      return `${ageInYears}y ${ageInMonthsRemainder}mo`
    }
  }
}

const main = async() => {
  let date = new Date().getDay();
  // run every Friday because his birthday was on a Friday
  if (date === 5) {
    console.log("logging into ig");
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  
    // logout of ig when done, don't need to wait for requests to resolve
    process.nextTick(async () => await ig.simulate.postLoginFlow());
  
    console.log('calculating age');
    const ageString = calculateAge();
    console.log(`age: ${ageString}`);
  
    console.log('setting biography');
    console.log(`š¶ cavachon\nš ${ageString}`);
    await ig.account.setBiography(`š¶ cavachon\nš ${ageString}`)
    console.log('all done, https://www.instagram.com/hello.monte/');
  } else {
    console.log("It's not Friday");
  }
}

console.log("starting...");
main();