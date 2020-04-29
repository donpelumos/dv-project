var LOCATIONS = [];
var ITEMS = [];
var CATEGORIES = [];
var DATA = [];

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
    //drawColumnChart({data: [{label: "boy", value:5}, {label: "girl", value :10}], selector: "#container-1 svg", option: option});
    console.log();
}
function extractLocations(data){
    data.forEach((row) => {
        if(!LOCATIONS.includes(row.location)){
            LOCATIONS.push(row.location);
        }
    });
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
    drawBarChart({data: topTenMostPopular, selector: "#container-1 svg", option: mostPopularOptions});
    drawBarChart({data: topTenLeastPopular, selector: "#container-2 svg", option: leastPopularOptions});
    console.log();
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


const drawBarChart = ({ data, selector, option }) => {
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
        .attr('fill', 'steelblue')
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