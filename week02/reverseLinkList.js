// interface LinkNodeType {
//     next?: LinkNodeType|null;
//     value: any,
// }

class LinkNode {
    next = undefined;
    value = null;
    constructor(value) {
        this.value = value;
    }
}

function reverseLinkList(head) {
    if (!head.next) return head; // 链表只有一个元素则直接返回
    let [prev, current, next] = [null, head, head.next];
    while (current) {
        current.next = prev;
        [prev, current, next] = [current, next, next?.next];
    }
    return prev;
}

function printLinkList(head) {
    let str = head.value + '';
    let current = head;
    while (current.next) {
        current = current.next;
        str += `->${current.value}`;
    }
    console.log(str);
}

const head = new LinkNode(0);
let current = head;

let i = 1;

while (i < 15) {
    current.next = new LinkNode(i);
    current = current.next;
    i += 1;
}

printLinkList(head);

console.log('reverse');

printLinkList(reverseLinkList(head));