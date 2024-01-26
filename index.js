
function transform(sql = "", binds = [ { variable: "", value: "" } ]) {
    const test = handleJson(binds);
    let buffer = sql;

    for (const [key, value] of Object.entries(test)) {
        const pattern = ":" + key;
        const parsedValue = matchTypeAndParse(value);
        buffer = buffer.replace(pattern, parsedValue);
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

        const obj = {
            ...prev,
            [variable]: value
        };

        return obj;
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

const FORBIDDEN_KEY_PATTERN = /[.*+?^${}()|\-,@1-9[\]\\]/g;
const BIND_PATTERN = /[:]\w+[\s+|,]?/g;

(function () {
    const sql = "select * from table_test a where a.age = :age and a.name like :name";
    const binds = [{ 
        variable: "name",
        value: "Renan"
    },
    { 
        variable: "age",
        value: "25"
    },{
        variable: "year",
        value: "1992"
    },
    {
        variable: "ye@r",
        value: "1992"
    }
];

    const _sql = transform(sql, binds);
    console.log(_sql)
})();