var re = {
    connected: /^(\S+) connected (?:(\d+)x(\d+))?/,
    disconnected: /^(\S+) disconnected/,
    mode: /^\s+(\d+)x([0-9i]+)\s+((?:\d+\.)?\d+)([* ]?)([+ ]?)/,
    refreshRates: /\d+\.\d\d(?!\d)/g,
    selectedRefreshRate: /[^\s\,?!]*\*+[^\s\,?!]*/g
};

module.exports = function (src) {
    var lines = src.split('\n');
    var query = {};
    var last = null;
    var index = 0;
    
    lines.forEach(function (line) {
        var m;
        if (m = re.connected.exec(line)) {
            query[m[1]] = {
                connected: true,
                modes: [],
                index: index++
            };
            if (m[2] && m[3]) {
                query[m[1]].width = parseInt(m[2]);
                query[m[1]].height = parseInt(m[3]);
            }
            last = m[1];
        }
        else if (m = re.disconnected.exec(line)) {
            query[m[1]] = {
                connected: false,
                modes: [],
                index: index++
            };
            last = m[1];
        }
        else if (last && (m = re.mode.exec(line)) && (k = line.match(re.refreshRates))) {
            var selectedRefreshRate = line.match(re.selectedRefreshRate);
            if (selectedRefreshRate != null) {
		selectedRefreshRate = parseFloat(selectedRefreshRate[0].replace("*"));
            } else {
		selectedRefreshRate =  parseFloat(m[3]);
            }
            var r = {
                width: m[1],
                height: m[2],
                rate:selectedRefreshRate,
                isSelected: line.indexOf("*") != -1,
                refreshRates:  k,
                isPreffered: line.indexOf("+") != -1
            };
            query[last].modes.push(r);
            
            if (m[4] === '+') query[last]['native'] = r;
            if (m[5] === '*') query[last].current = r;
        }
        else {
            last = null;
        }
    });
    return query;
};
