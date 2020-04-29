var LOCATIONS = [];
var ITEMS = [];
var CATEGORIES = [];
var DATA = [];
var YEAR_RANGE_SELECTED_3 = "0";
var MONTH_RANGE_SELECTED_3 = "0";
var WEEK_RANGE_SELECTED_3 = "0";
var MONTH_RANGE_SELECTED_2 = "0";
var YEAR_RANGE_SELECTED_2 = "0";
var YEAR_RANGE_SELECTED_1 = "0";
var HOLIDAY_SELECTED = "0";

$(document).ready(function(){
    (async () => {
        const data = await d3.csv('js/project-data.csv');
        //console.log(data);
        readDataFile(data);
    })();

    $("#age-range-selector").change(function(){
        var selectedAgeRange = $(this).children("option:selected").val();
        if(selectedAgeRange != "0"){
            var lowerAgeLimit = parseInt(selectedAgeRange.split("-")[0]);
            var upperAgeLimit = parseInt(selectedAgeRange.split("-")[1]);
            getTopTenItemsByAgeRange(DATA, lowerAgeLimit, upperAgeLimit);
        }
    });

    $("#gender-range-selector").change(function(){
        var selectedGender = $(this).children("option:selected").val();
        if(selectedGender != "0"){
            getTopTenItemsByGender(DATA, selectedGender);
        }
    });

    $("#location-range-selector").change(function(){
        var selectedLocation = $(this).children("option:selected").val();
        if(selectedLocation != "0"){
            getTopTenItemsByLocation(DATA, selectedLocation);
        }
    });

    $("#year-range-selector-3").change(function(){
        var selectedYear = $(this).children("option:selected").val();
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
        var selectedMonth = $(this).children("option:selected").val();
        if(selectedMonth == "0"){
            $("#week-range-selector-3").prop('disabled', true);
        }
        else{
            $("#week-range-selector-3").prop('disabled', false);
        }
        MONTH_RANGE_SELECTED_3 = selectedMonth;
    });

    $("#week-range-selector-3").change(function(){
        var selectedWeek = $(this).children("option:selected").val();
        if(selectedWeek != "0"){
            getTopFiveItemsByWeek(DATA, YEAR_RANGE_SELECTED_3, MONTH_RANGE_SELECTED_3, selectedWeek);
        }
        WEEK_RANGE_SELECTED_3 = selectedWeek;
    });

    $("#year-range-selector-2").change(function(){
        var selectedYear = $(this).children("option:selected").val();
        if(selectedYear == "0"){
            $("#month-range-selector-2").prop('disabled', true);
        }
        else{
            $("#month-range-selector-2").prop('disabled', false);
        }
        YEAR_RANGE_SELECTED_2 = selectedYear;
    });

    $("#month-range-selector-2").change(function(){
        var selectedMonth = $(this).children("option:selected").val();
        if(selectedMonth != "0"){
            getTopFiveItemsByMonth(DATA, YEAR_RANGE_SELECTED_2, selectedMonth);
        }
        MONTH_RANGE_SELECTED_2 = selectedMonth;
    });

    $("#year-range-selector-1").change(function(){
        var selectedYear = $(this).children("option:selected").val();
        if(selectedYear != "0"){
            getTopFiveItemsByYear(DATA, selectedYear);
        }
        YEAR_RANGE_SELECTED_1 = selectedYear;
    });

    $("#holiday-selector").change(function(){
        var selectedHoliday = $(this).children("option:selected").val();
        if(selectedHoliday == "0"){
            $("#holiday-year-selector").prop('disabled', true);
        }
        else{
            $("#holiday-year-selector").prop('disabled', false);
        }
        HOLIDAY_SELECTED = selectedHoliday;
    });

    $("#holiday-year-selector").change(function(){
        var selectedHolidayYear = $(this).children("option:selected").val();
        if(selectedHolidayYear != "0"){
            getTopFiveItemsByHoliday(DATA, HOLIDAY_SELECTED, selectedHolidayYear);
        }
    });

});

function readDataFile(data){
    extractLocations(data);
    extractItems(data);
    extractCategories(data);
    DATA = data;
    const option = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular vs Least Popular Item',
    };
    //drawColumnChart({data: [{label: "boy", value:5}, {label: "girl", value :10}], selector: "#container-top-items-by-age svg", option: option});
    console.log();
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
function populateLocations(locations){
    locations.sort();
    $.each(locations, function (index, location) {
        var locationOptionString = `
            <option value="${location}"> ${location.substr(0,1).toLocaleUpperCase()+location.substr(1).toLowerCase()}</option>
            `;
        $("#location-range-selector").append(locationOptionString);
    });
}

function getTopTenItemsByAgeRange(data, lowerAge, upperAge){
    var itemCountMap = {};
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

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topTenMostPopular = extractTopNProperties(itemCountMap,countValues,10);
    var topTenLeastPopular = extractLastNProperties(itemCountMap, countValues, 10);

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
    console.log();
}

function getTopTenItemsByGender(data, gender){
    var itemCountMap = {};
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

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topTenMostPopular = extractTopNProperties(itemCountMap,countValues,10);
    var topTenLeastPopular = extractLastNProperties(itemCountMap, countValues, 10);

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
    console.log();
}

function getTopTenItemsByLocation(data, location){
    var itemCountMap = {};
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

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topTenMostPopular = extractTopNProperties(itemCountMap,countValues,10);
    var topTenLeastPopular = extractLastNProperties(itemCountMap, countValues, 10);

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
    console.log();
}

function getTopFiveItemsByYear(data, year){
    var itemCountMap = {};
    ITEMS.forEach((item) => {
        itemCountMap[item] = 0;
    });
    Object.keys(itemCountMap).forEach((item) => {
        data.forEach((record) => {
            var recordYear = record.date.split("-")[0];
            if(recordYear == year && record.item == item){
                itemCountMap[item] = itemCountMap[item] + parseInt(record.quantity);
            }
        });
    });

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Year',
    };
    let colour = '#17742c';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-year svg", option: mostPopularOptions, colour: colour});
    console.log();
}

function getTopFiveItemsByMonth(data, year, month){
    var itemCountMap = {};
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

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Month',
    };
    let colour = '#70742f';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-month svg", option: mostPopularOptions, colour: colour});
    console.log();
}

function getTopFiveItemsByWeek(data, year, month, week){
    var itemCountMap = {};
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

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Week',
    };
    let colour = '#744743';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-week svg", option: mostPopularOptions, colour: colour});
    console.log();
}

function getTopFiveItemsByHoliday(data, holiday, holidayYear){
    var itemCountMap = {};
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

    var countValues = [];
    for(var itemName in itemCountMap){
        countValues.push(itemCountMap[itemName]);
    }
    countValues.sort((a, b) => b - a);//sort the counts in descending order
    var topFiveMostPopular = extractTopNProperties(itemCountMap,countValues,5);

    const mostPopularOptions = {
        format: 'd',
        yLabel: 'Quantity',
        title: 'Most Popular Items By Holiday',
    };
    let colour = '#747474';
    drawBarChart({data: topFiveMostPopular, selector: "#container-top-items-by-holiday svg", option: mostPopularOptions, colour: colour});
    console.log();
}

function isHolidayValid(date, holidayName){
    if(holidayName == "easter"){
        let day = parseInt(date.split("-")[2]);
        let month = parseInt(date.split("-")[1]);
        if((month == 3 && day > 20) || (month == 4 && day < 16)){
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