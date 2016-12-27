'use strict';

function ListItem(content) {
    this.link = null;
    this.content = content;
}

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
    }
};

ListItem.prototype.destroy = function () {
    this.content = null;
    this.link = null;
};

function List(sortFunc) {
    this.head = new ListItem();
    this.sorter = sortFunc || function () {
        return false;
    };
}

List.prototype.destroy = function () {
    var item = this.head,
        temp;

    while (item) {
        temp = item;
        item = item.link;
        temp.destroy();
    }
};

List.prototype.empty = function () {
    return !this.head.content;
};

List.prototype.add = function (content, afterItem) {
    if (this.head.empty()) {
        this.head.content = content;

        return null;
    }

    var newItem = new ListItem(content),
        item = afterItem || this.lastItemToSatisfy(this.sorter.bind(null, content));

    if (!item) {
        this.head.linkTo(newItem);
        this.head = newItem;
    } else {
        newItem.linkTo(item);
    }

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
        }

        prevItem = item;
        item = item.link;
    }
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