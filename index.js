'use strict';

function ListItem(content) {
    this.link = null;
    this.content = content;
}

ListItem.prototype.destroy = function () {
    this.content = null;
    this.link = null;
};

ListItem.prototype.linkTo = function (item) {
    if (item && item.link) {
        this.link = item.link;
    }

    item.link = this;
};

ListItem.prototype.empty = function () {
    return typeof this.content === 'undefined';
};

ListItem.prototype.apply = function (func) {
    if (typeof this.content !== 'undefined' && typeof func === 'function') {
        return func(this.content, this);
    } else {
        return false;
    }
};

function List(sortFunc) {
    this.head = new ListItem();
    this.sorter = sortFunc || function () {
        return false;
    };
    this.length = 0;
}

List.prototype.destroy = function () {
    this.purge();
    this.length = 0;
    this.sorter = null;
    this.head = null;
};

List.prototype.purge = function () {
    var item = this.head,
        temp;

    while (item) {
        temp = item;
        item = item.link;
        temp.destroy();
    }

    this.head.content = undefined;
    this.length = 0;
};

List.prototype.empty = function () {
    return !this.head.content;
};

List.prototype.add = function (content, afterItem) {
    if (this.head.empty()) {
        this.head.content = content;
        this.length = 1;

        return this.head;
    }

    var newItem = new ListItem(content),
        item = afterItem || this.lastItemToSatisfy(this.sorter.bind(null, content));

    if (!item) {
        this.head.linkTo(newItem);
        this.head = newItem;
    } else {
        newItem.linkTo(item);
    }

    this.length++;

    return newItem;
};

List.prototype.removeOne = function (listItem) {
    var item = this.head,
        prevItem;

    while (item) {
        if (item === listItem) {
            if (item === this.head) {
                if (item.link) {
                    this.head = item.link;
                    item.destroy();
                } else {
                    this.head.content = undefined;
                }
            } else {
                prevItem.link = item.link;
                item.destroy();
            }

            this.length--;

            return true;
        }

        prevItem = item;
        item = item.link;
    }

    return false;
};

List.prototype.findOne = function (func) {
    var item = this.firstItemToSatisty(func);

    return item && item.content ? item.content : null;
};

List.prototype.forEach = function (func) {
    var item = this.head;

    while (item) {
        item.apply(func);
        item = item.link;
    }
};

List.prototype.forEachWithCondition = function (func) {
    var result,
        item = this.head;

    while (item) {
        result = item.apply(func);

        if (typeof result !== 'undefined') {
            return result;
        }

        item = item.link;
    }
};

List.prototype.drain = function () {
    var result = [],
        countObj = {
            count: 0
        };

    result.length = this.length;
    this.forEach(drainer.bind(null, result, countObj));
    this.purge();

    return result;
};

List.prototype.logs = function () {
    this.forEach(console.log.bind(console));
};

List.prototype.lastItemToSatisfy = function (func) {
    var item = this.head,
        check,
        result;

    while (item) {
        check = item.apply(func);

        if (typeof check !== 'boolean') {
            throw 'func needs to return a boolean value';
        }

        if (!check) {
            return result;
        } else {
            result = item;
            item = item.link;
        }
    }

    return result;
};

List.prototype.firstItemToSatisty = function (func) {
    var check = false,
        item = this.head;

    while (!check && item) {
        check = item.apply(func);

        if (typeof check !== 'boolean') {
            throw 'func needs to return a boolean value';
        }

        if (check) {
            return item;
        } else {
            item = item.link;
        }
    }

    return item;
};

function drainer(array, countObj, content) {
    array[countObj.count] = content;
    countObj.count++;
}

module.exports = List;