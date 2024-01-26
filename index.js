
const FORBIDDEN_KEY_PATTERN = /[.*+?^${}()|\-,@1-9[\]\\]/g;
const BIND_PATTERN = /[:]\w+[\s+]?/g;
const END_BIND_PATTERN = /[,\s+?|\s+|\Z|()]/g;

function transform(sql = "", binds = [ { variable: "", value: "" } ]) {
    const json = handleJson(binds);
    let buffer = "";
    let begin = 0;
    let flag = false;

    for (let index = 0; index <= sql.length; index++) {
        if (!flag && sql.charAt(index).match(":")) {
            begin = index + 1;
            flag = true;
        }

        if (flag && (sql.charAt(index).match(END_BIND_PATTERN) || index === sql.length)) {
            flag = false;

            const property = sql.substring(begin, index);
            const value = matchTypeAndParse(json[property]);
            buffer += value;
        }

        if (!flag) {
            buffer += sql.charAt(index);
        }
    }

    return buffer;
} 

function handleJson(binds = [ { variable: "", value: "" } ]) {
    return binds.reduce((prev, current, index) => {
        const { variable, value } = current;

        if (sanitizeKey(variable)) {
            return prev;
        }

        if (index === 0) {
            return {
                [variable]: value
            };
        }

        return {
            ...prev,
            [variable]: value
        };
    }, []);
}

function sanitizeKey(key) {
    return key.match(FORBIDDEN_KEY_PATTERN);
}

function sanitizeIfSqlHasBindVariable(sql) {
    return sql.match(BIND_PATTERN);
}

function matchTypeAndParse(value) {
    const number = Number.parseFloat(value);

    if (!Object.is(number, NaN)) {
        return number;
    }

    if (typeof value === "string") {
        return `'${value}'`;
    }

    if (Object.is(value, 'null') || Object.is(value, 'undefined')) {
        return 'NULL';
    }

    return 'NULL';
}

(function () {
    const sql = "select * from table_test a where a.age = :age and a.name like :name";
    const sql2 = "insert into table (name, age, year) values (:name, :age, :year)";
    const sql3 = "delete from table when value = :year"
    const binds = [
        { 
            variable: "name",
            value: "Renan"
        },
        { 
            variable: "age",
            value: "25"
        },
        {
            variable: "year",
            value: "1992"
        },
        {
            variable: "ye@r",
            value: "1992"
        }
    ];

    const _sql = transform(sql + "\n" + sql2 + "\n" + sql3, binds);
    console.log("oi");
    console.log(_sql)
})();
