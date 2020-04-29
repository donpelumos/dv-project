let LOCATIONS = [];
let ITEMS = [];
let CATEGORIES = [];
let GENDERS = [];
let DATA = [];
let YEAR_RANGE_SELECTED_3 = "0";
let MONTH_RANGE_SELECTED_3 = "0";
let WEEK_RANGE_SELECTED_3 = "0";
let MONTH_RANGE_SELECTED_2 = "0";
let YEAR_RANGE_SELECTED_2 = "0";
let YEAR_RANGE_SELECTED_1 = "0";
let HOLIDAY_SELECTED = "0";
let SALES_YEAR_SELECTED = "0";

$(document).ready(function(){
    (async () => {
        const data = await d3.csv('js/project-data.csv');
        //console.log(data);
        readDataFile(data);
    })();

    $("#age-range-selector").change(function(){
        let selectedAgeRange = $(this).children("option:selected").val();
        if(selectedAgeRange != "0"){
            let lowerAgeLimit = parseInt(selectedAgeRange.split("-")[0]);
            let upperAgeLimit = parseInt(selectedAgeRange.split("-")[1]);
            getTopTenItemsByAgeRange(DATA, lowerAgeLimit, upperAgeLimit);
        }
    });

    $("#gender-range-selector").change(function(){
        let selectedGender = $(this).children("option:selected").val();
        if(selectedGender != "0"){
            getTopTenItemsByGender(DATA, selectedGender);
        }
    });

    $("#location-range-selector").change(function(){
        let selectedLocation = $(this).children("option:selected").val();
        if(selectedLocation != "0"){
            getTopTenItemsByLocation(DATA, selectedLocation);
        }
    });

    $("#year-range-selector-3").change(function(){
        let selectedYear = $(this).children("option:selected").val();
        if(selectedYear == "0"){
            $("#month-range-selector-3").prop('disabled', true);
            $("#week-range-selector-3").prop('disabled', true);
        }
        else{
            $("#month-range-selector-3").prop('disabled', false);

        }
        YEAR_RANGE_SELECTED_3 = selectedYear;
    });

    $("#month-range-selector-3").change(function(){
        let selectedMonth = $(this).children("option:selected").val();
        if(selectedMonth == "0"){
            $("#week-range-selector-3").prop('disabled', true);
        }
        else{
            $("#week-range-selector-3").prop('disabled', false);
        }
        MONTH_RANGE_SELECTED_3 = selectedMonth;
    });

    $("#week-range-selector-3").change(function(){
        let selectedWeek = $(this).children("option:selected").val();
        if(selectedWeek != "0"){
            getTopFiveItemsByWeek(DATA, YEAR_RANGE_SELECTED_3, MONTH_RANGE_SELECTED_3, selectedWeek);
        }
        WEEK_RANGE_SELECTED_3 = selectedWeek;
    });

    $("#year-range-selector-2").change(function(){
        let selectedYear = $(this).children("option:selected").val();
        if(selectedYear == "0"){
            $("#month-range-selector-2").prop('disabled', true);
        }
        else{
            $("#month-range-selector-2").prop('disabled', false);
        }
        YEAR_RANGE_SELECTED_2 = selectedYear;
    });

    $("#month-range-selector-2").change(function(){
        let selectedMonth = $(this).children("option:selected").val();
        if(selectedMonth != "0"){
            getTopFiveItemsByMonth(DATA, YEAR_RANGE_SELECTED_2, selectedMonth);
        }
        MONTH_RANGE_SELECTED_2 = selectedMonth;
    });

    $("#year-range-selector-1").change(function(){
        let selectedYear = $(this).children("option:selected").val();
        if(selectedYear != "0"){
            getTopFiveItemsByYear(DATA, selectedYear);
        }
        YEAR_RANGE_SELECTED_1 = selectedYear;
    });

    $("#holiday-selector").change(function(){
        let selectedHoliday = $(this).children("option:selected").val();
        if(selectedHoliday == "0"){
            $("#holiday-year-selector").prop('disabled', true);
        }
        else{
            $("#holiday-year-selector").prop('disabled', false);
        }
        HOLIDAY_SELECTED = selectedHoliday;
    });

    $("#holiday-year-selector").change(function(){
        let selectedHolidayYear = $(this).children("option:selected").val();
        if(selectedHolidayYear != "0"){
            getTopFiveItemsByHoliday(DATA, HOLIDAY_SELECTED, selectedHolidayYear);
        }
    });

    $("#sales-year-selector").change(function(){
        let selectedYear = $(this).children("option:selected").val();
        if(selectedYear != "0"){
            getSalesPerQuarter(selectedYear);
        }
        SALES_YEAR_SELECTED = selectedYear;
    });
});

function readDataFile(data){
    extractLocations(data);
    extractItems(data);
    extractCategories(data);
    extractGenders(data);
    DATA = data;
    getAgeDemographics();
    getGenderDemographics();
    getLocationDemographics();
    getSalesPerYear();
    //drawColumnChart({data: [{label: "boy", value:5}, {label: "girl", value :10}], selector: "#container-top-items-by-age svg", option: option});
    //console.log();
}
function extractLocations(data){
    data.forEach((row) => {
        if(!LOCATIONS.includes(row.location)){
            LOCATIONS.push(row.location);
        }
    });
    populateLocations(LOCATIONS);
}
function extractItems(data){
    data.forEach((row) => {
        if(!ITEMS.includes(row.item)){
            ITEMS.push(row.item);
        }
    });
}
function extractCategories(data){
    data.forEach((row) => {
        if(!CATEGORIES.includes(row.category)){
            CATEGORIES.push(row.category);
        }
    });
}
function extractGenders(data){
    data.forEach((row) => {
        if(!GENDERS.includes(row.gender)){
            GENDERS.push(row.gender);
        }
    });
}
function populateLocations(locations){
    locations.sort();
    $.each(locations, function (index, location) {
        let locationOptionString = `
            <option value="${location}"> ${location.substr(0,1).toLocaleUpperCase()+location.substr(1).toLowerCase()}</option>
            `;
        $("#location-range-selector").append(locationOptionString);
    });
}

function getTopTenItemsByAgeRange(data, lowerAge, upperAge){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            if(parseInt(record.age) >= lowerAge && parseInt(record.age) <= upperAge && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topTenMostPopular = extractTopNProperties(itemCountMap,countValues,10);
    let topTenLeastPopular = extractLastNProperties(itemCountMap, countValues, 10);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items',
    };
    const leastPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Least Popular Items',
    };
    let colour = '#09155b';
    drawBarChart({data: topTenMostPopular, selector: "#container-top-items-by-age svg", option: mostPopularOptions, colour: colour});
    drawBarChart({data: topTenLeastPopular, selector: "#container-last-items-by-age svg", option: leastPopularOptions, colour: colour});
    //console.log();
}

function getTopTenItemsByGender(data, gender){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            if(record.gender == gender && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topTenMostPopular = extractTopNProperties(itemCountMap,countValues,10);
    let topTenLeastPopular = extractLastNProperties(itemCountMap, countValues, 10);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items',
    };
    const leastPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Least Popular Items',
    };
    let colour = '#1e7430';
    drawBarChart({data: topTenMostPopular, selector: "#container-top-items-by-gender svg", option: mostPopularOptions, colour: colour});
    drawBarChart({data: topTenLeastPopular, selector: "#container-last-items-by-gender svg", option: leastPopularOptions, colour: colour});
    //console.log();
}

function getTopTenItemsByLocation(data, location){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            if(record.location == location && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topTenMostPopular = extractTopNProperties(itemCountMap,countValues,10);
    let topTenLeastPopular = extractLastNProperties(itemCountMap, countValues, 10);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items',
    };
    const leastPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Least Popular Items',
    };
    let colour = '#0f6c74';
    drawBarChart({data: topTenMostPopular, selector: "#container-top-items-by-location svg", option: mostPopularOptions, colour: colour});
    drawBarChart({data: topTenLeastPopular, selector: "#container-last-items-by-location svg", option: leastPopularOptions, colour: colour});
    //console.log();
}

function getTopFiveItemsByYear(data, year){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            let recordYear = record.date.split("-")[0];
            if(recordYear == year && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Year',
    };
    let colour = '#17742c';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-year svg", option: mostPopularOptions, colour: colour});
    //console.log();
}

function getTopFiveItemsByMonth(data, year, month){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            let recordYear = record.date.split("-")[0];
            let recordMonth = record.date.split("-")[1];
            if(recordYear == year && recordMonth == month && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Month',
    };
    let colour = '#70742f';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-month svg", option: mostPopularOptions, colour: colour});
    //console.log();
}

function getTopFiveItemsByWeek(data, year, month, week){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            let recordYear = record.date.split("-")[0];
            let recordMonth = record.date.split("-")[1];
            let recordWeek = getWeekFromDay(record.date.split("-")[2]);
            if(recordYear == year && recordMonth == month && recordWeek == week && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Week',
    };
    let colour = '#744743';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-week svg", option: mostPopularOptions, colour: colour});
    //console.log();
}

function getTopFiveItemsByHoliday(data, holiday, holidayYear){
    let itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            let recordDate = record.date;
            let recordYear = record.date.split("-")[0];
            let isValidHoliday = isHolidayValid(recordDate, holiday);
            if(isValidHoliday && recordYear == holidayYear && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    let countValues = [];
    for(let itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    let topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Holiday',
    };
    let colour = '#747474';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-holiday svg", option: mostPopularOptions, colour: colour});
    //console.log();
}

function getAgeDemographics(){
    let data = DATA;
    let ageClassifiers = [{range: "18 - 29", value: {lowerAge: 18, upperAge: 29}, count: 0},
        {range: "30 - 44", value: {lowerAge: 30, upperAge: 44}, count: 0},
        {range: "45 - 65", value: {lowerAge: 45, upperAge: 65}, count: 0}];
    ageClassifiers.forEach((ageClassifier) => {
        data.forEach((record) => {
            if(parseInt(record.age) >= ageClassifier.value.lowerAge && parseInt(record.age) <= ageClassifier.value.upperAge){
                ageClassifier.count = ageClassifier.count + 1;
            }
        });
    });
    let usersByAge = [];
    ageClassifiers.forEach((ageClassifier) => {
        usersByAge.push({label: ageClassifier.range, value: ageClassifier.count});
    });
    
    drawDonutChart({data: usersByAge, selector: "#container-demographics-by-age svg"});
    //console.log();
}

function getGenderDemographics(){
    let data = DATA;
    let genderClassifiers = [{name: "MALE", value: "male", count: 0},{name: "FEMALE", value: "female", count: 0}];
    genderClassifiers.forEach((genderClassifier) => {
        data.forEach((record) => {
            if(record.gender === genderClassifier.value){
                genderClassifier.count = genderClassifier.count + 1;
            }
        });
    });
    let usersByGender = [];
    genderClassifiers.forEach((genderClassifier) => {
        usersByGender.push({label: genderClassifier.name, value: genderClassifier.count});
    });

    drawDonutChart({data: usersByGender, selector: "#container-demographics-by-gender svg"});
    //console.log();
}

function getLocationDemographics(){
    let locationClassifiers = LOCATIONS.map((location) => {
        return {label: location, value: 0};
    });
    locationClassifiers.forEach((locationClassifier) => {
        DATA.forEach((record) => {
            if(record.location === locationClassifier.label){
                locationClassifier.value = locationClassifier.value + 1;
            }
        });
    });
    drawDonutChart({data: locationClassifiers, selector: "#container-demographics-by-location svg"});
    //console.log();
}

function getSalesPerYear(){
    let salesMap = [{label: 2019, value: 0.0}, {label: 2018, value: 0.0}, {label: 2017, value: 0.0}];
    salesMap.forEach((yearSale) => {
        DATA.forEach((record) => {
            let totalPrice = parseFloat(record.total_price);
            let recordYear = parseInt(record.date.split("-")[0]);
            if(recordYear === yearSale.label){
                yearSale.value = parseFloat((yearSale.value + totalPrice).toFixed(2));
            }
        });
    });
    const salesOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Sales Per Annum',
    };
    let colour = '#5b141f';
    drawBarChartMoney({data: salesMap, selector: "#container-sales-by-year svg", option: salesOptions, colour: colour});
    console.log();
}

function getSalesPerQuarter(year){
    year = parseInt(year);
    let quarterMap = [{label: 1, value: 0.0}, {label: 2, value: 0.0}, {label: 3, value: 0.0}, {label: 4, value: 0.0}];
    quarterMap.forEach((quarterSale) => {
        DATA.forEach((record) => {
            let recordTotalPrice = parseFloat(record.total_price);
            let recordYear = parseInt(record.date.split("-")[0]);
            let recordDate = record.date;
            let isCorrectQuarter = isDateWithinQuarter(recordDate, quarterSale.label);
            if(recordYear === year && isCorrectQuarter){
                quarterSale.value = quarterSale.value + recordTotalPrice;
            }
        });
    });
    drawDonutChartMoney({data: quarterMap, selector: "#container-sales-by-quarter svg"});
    console.log();
}
function isDateWithinQuarter(date, quarter){
    let month = parseInt(date.split("-")[1]);
    if((month >= 1 && month < 4 && quarter == 1) || (month >= 4 && month < 7 && quarter == 2) || (month >= 7 && month < 10 && quarter == 3) ||
        (month >= 10 && month < 13 && quarter == 4)){
        return true
    }
    return false;
}

function isHolidayValid(date, holidayName){
    let day = parseInt(date.split("-")[2]);
    let month = parseInt(date.split("-")[1]);
    if(holidayName === "easter"){
        if((month === 3 && day > 20) || (month === 4 && day < 16)){
            return true;
        }
        else{
            return false;
        }
    }
    else if(holidayName === "christmas"){
        if(month === 12 && day > 14){
            return true;
        }
        else{
            return false;
        }
    }
    return false;
}

function getWeekFromDay(day){
    day = parseInt(day);
    if(day >= 1 && day < 8){
        return "1";
    }
    else if(day >= 8 && day < 15){
        return "2";
    }
    else if(day >= 15 && day < 22){
        return "3";
    }
    else{
        return "4";
    }
}

function extractTopNProperties(objectMap, sortedValues, topN){
    let addedTopItems = [];
    let topNItems = [];
    for(let i =0; i < topN; i++){
        for(let itemName in objectMap){
            if(objectMap[itemName] == sortedValues[i] && !addedTopItems.includes(itemName)){
                let resultObject = {label: itemName, value: sortedValues[i]};
                addedTopItems.push(itemName);
                topNItems.push(resultObject);
            }
        }
        if(topNItems.length == topN){
            break;
        }
    }
    return topNItems;
}

function extractLastNProperties(objectMap, sortedValues, topN){
    let addedLeastItems = [];
    let lastNItems = [];
    for(let i =sortedValues.length; i > sortedValues.length-topN; i--){
        for(let itemName in objectMap){
            if(objectMap[itemName] == sortedValues[i-1] && !addedLeastItems.includes(itemName)){
                let resultObject = {label: itemName, value: sortedValues[i-1]};
                addedLeastItems.push(itemName);
                lastNItems.push(resultObject);
            }
        }
        if(lastNItems.length == topN){
            break;
        }
    }
    return lastNItems;
}

const drawBarChart = ({ data, selector, option , colour}) => {
    $(selector).html("");

    const barHeight = 25;
    const margin = { top: 80, right: 0, bottom: 20, left: 70 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

    const svg = d3.select(selector).attr('viewBox', [0, 0, width, height]);

    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([margin.left, width - margin.right]);
    const y = d3
        .scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);

    const xAxis = (g) =>
        g
            .attr('transform', `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(width / 80, option.format))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .select('.tick:first-of-type text')
                    .clone()
                    .attr('x', 0)
                    .attr('y', -30)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'currentColor')
                    .text(option.yLabel)
            );
    const yAxis = (g) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickFormat((i) => data[i].label)
                    .tickSizeOuter(0)
            )
            .call((g) => g.selectAll('text').attr('transform', 'rotate(10)'));

    const format = x.tickFormat(20, option.format);

    svg
        .append('g')
        .attr('fill', colour)
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', x(0))
        .attr('y', (d, i) => y(i))
        .attr('width', (d) => x(d.value) - x(0))
        .attr('height', y.bandwidth());
    svg
        .append('g')
        .attr('fill', 'white')
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', (d) => x(d.value) - 4)
        .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .text((d) => format(d.value));
    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg
        .append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 3)
        .attr('text-anchor', 'middle')
        .text(option.title);
};

const drawBarChartMoney = ({ data, selector, option , colour}) => {
    $(selector).html("");

    const barHeight = 25;
    const margin = { top: 80, right: 0, bottom: 20, left: 70 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

    const svg = d3.select(selector).attr('viewBox', [0, 0, width, height]);

    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([margin.left, width - margin.right]);
    const y = d3
        .scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);

    const xAxis = (g) =>
        g
            .attr('transform', `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(width / 80, option.format))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .select('.tick:first-of-type text')
                    .clone()
                    .attr('x', 0)
                    .attr('y', -30)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'currentColor')
                    .text(option.yLabel)
            );
    const yAxis = (g) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickFormat((i) => data[i].label)
                    .tickSizeOuter(0)
            )
            .call((g) => g.selectAll('text').attr('transform', 'rotate(10)'));

    const format = x.tickFormat(20, option.format);
    let currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
    });

    svg
        .append('g')
        .attr('fill', colour)
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', x(0))
        .attr('y', (d, i) => y(i))
        .attr('width', (d) => x(d.value) - x(0))
        .attr('height', y.bandwidth());
    svg
        .append('g')
        .attr('fill', 'white')
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', (d) => x(d.value) - 4)
        .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .text((d) => currencyFormatter.format(format(d.value)));
    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg
        .append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 3)
        .attr('text-anchor', 'middle')
        .text(option.title);
};

const drawDonutChart = ({ data, selector }) => {
    $(selector).html("");

    const margin = { top: 80, right: 20, bottom: 20, left: 80 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.min(width, 400);

    const svg = d3.select(selector).attr('viewBox', [-width / 2, -height / 2, width, height]);

    const pie = d3
        .pie()
        .padAngle(0.005)
        .sort(null)
        .value((d) => d.value);
    const radius = Math.min(width, height) / 2;
    const arc = d3
        .arc()
        .innerRadius(radius * 0.45)
        .outerRadius(radius - 1);
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.label))
        .range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    const arcs = pie(data);

    svg
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => color(d.data.label))
        .attr('d', arc)
        .append('title')
        .text((d) => `${d.data.label}: ${d.data.value.toLocaleString()}`);

    svg
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 17)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arc.centroid(d)})`)
        .call((text) =>
            text
                .append('tspan')
                .attr('y', '-0.4em')
                .attr('font-weight', 'bold')
                .text((d) => d.data.label)
        )
        .call((text) =>
            text
                .filter((d) => d.endAngle - d.startAngle > 0.25)
                .append('tspan')
                .attr('x', 0)
                .attr('y', '0.7em')
                .attr('fill-opacity', 0.7)
                .text((d) => d.data.value.toLocaleString())
        );
};

const drawDonutChartMoney = ({ data, selector }) => {
    $(selector).html("");

    const margin = { top: 80, right: 20, bottom: 20, left: 80 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.min(width, 400);

    const svg = d3.select(selector).attr('viewBox', [-width / 2, -height / 2, width, height]);

    const pie = d3
        .pie()
        .padAngle(0.005)
        .sort(null)
        .value((d) => d.value);
    const radius = Math.min(width, height) / 2;
    const arc = d3
        .arc()
        .innerRadius(radius * 0.45)
        .outerRadius(radius - 1);
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.label))
        .range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    const arcs = pie(data);
    let currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
    });

    svg
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => color(d.data.label))
        .attr('d', arc)
        .append('title')
        .text((d) => `${d.data.label}: ${d.data.value.toLocaleString()}`);

    svg
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 15)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arc.centroid(d)})`)
        .call((text) =>
            text
                .append('tspan')
                .attr('y', '-0.4em')
                .attr('font-weight', 'bold')
                .attr('fill-opacity', 0.9)
                .text((d) => d.data.label)
        )
        .call((text) =>
            text
                .filter((d) => d.endAngle - d.startAngle > 0.25)
                .append('tspan')
                .attr('x', 0)
                .attr('y', '0.7em')
                .attr('fill-opacity', 0.9)
                .text((d) => currencyFormatter.format(d.data.value))
        );
};

const drawLineChart = ({ data, selector, option }) => {
    $(selector).innerHTML = '';

    const margin = { top: 80, right: 20, bottom: 20, left: 60 },
        width = $(selector).width() - margin.left - margin.right,
        height = $(selector).height() - margin.top - margin.bottom;

    const svg = d3.select(selector).attr('viewBox', [0, 0, width, height]);

    const line = d3
        .line()
        .defined((d) => !isNaN(d.value))
        .x((d) => x(d.label))
        .y((d) => y(d.value));

    const x = d3
        .scaleUtc()
        .domain(d3.extent(data, (d) => d.label))
        .range([margin.left, width - margin.right]);
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = (g) =>
        g.attr('transform', `translate(0,${height - margin.bottom})`).call(
            d3
                .axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
        );
    const yAxis = (g) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call((g) =>
                g
                    .select('.tick:last-of-type text')
                    .clone()
                    .attr('x', -20)
                    .attr('y', -20)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'currentColor')
                    .text(option.yLabel)
            );

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#80cbc4')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);
    svg
        .append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 4)
        .attr('text-anchor', 'middle')
        .text(option.title);
};

const drawColumnChart = ({ data, selector, option }) => {
    $(selector).html("");

    const margin = { top: 80, right: 20, bottom: 20, left: 60 },
        width = $(selector).width() - margin.left - margin.right,
        height = $(selector).height() - margin.top - margin.bottom;

    const svg = d3.select(selector).attr('viewBox', [0, 0, width, height]);

    const x = d3
        .scaleBand()
        .domain(d3.range(data.length))
        .range([margin.left, width - margin.right])
        .padding(0.1);
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = (g) =>
        g.attr('transform', `translate(0,${height - margin.bottom})`).call(
            d3
                .axisBottom(x)
                .tickFormat((i) => data[i].label)
                .tickSizeOuter(0)
        );
    const yAxis = (g) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(null, option.format))
            .call((g) =>
                g
                    .select('.tick:last-of-type text')
                    .clone()
                    .attr('x', -20)
                    .attr('y', -20)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'currentColor')
                    .text(option.yLabel)
            );

    svg
        .append('g')
        .attr('fill', 'steelblue')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d, i) => x(i))
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => y(0) - y(d.value))
        .attr('width', x.bandwidth());
    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg
        .append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 4)
        .attr('text-anchor', 'middle')
        .text(option.title);
};