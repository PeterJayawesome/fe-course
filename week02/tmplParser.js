// 尝试转成vnode再用document根据vnode创建dom对象，转换成vnode的逻辑比较粗糙，edgecase会比较多没有覆盖到

let tmpl = `<div class="newslist">
    <div class="img" v-if="info.showImage"><img src="{{image}}"/></div>
    <div class="date" v-if="info.showDate">{{info.name}}</div>
    <div class="img">{{info.name}}</div>
</div>`;

const statusMap = {
  0: "Waiting Element Start Tag",
  1: "Waiting Element Start Tag Name",
  2: "Waiting Element Start Tag Name End",
  3: "Waiting Tag Close Or Attr Name",
  4: "Waiting Start Tag Or End Tag Start",
  5: "Waiting Element Attr Name End",
  6: "Waiting Element Attr Value",
  7: "Waiting Element Attr Value End",
	8: "Waiting Self Close Element Tag Close",
	9: "Waiting Element Start Tag Name Or Element Close Tag Slash",
	10: "Waiting Element Close Tag Name End",
	11: "End Of Root Element",
};

const isLowerCaseChar = (s) => (s.charCodeAt(0) < 123 && s.charCodeAt(0) > 96);

class Element {
  children = [];
  attrs = {};
  tagName = "";
  constructor(tagName) {
    this.tagName = tagName;
  }
}

function render(tmpl, data) {
  const domElementStack = [];
  let currentStatus = 0;
  let i = 0;
	let currentElement = null;
	let currentReadingTagName = '';
	let currentAttrName = '';
	let currentAttrValue = '';
	let currentChild = '';
	let rootElement = null;
  while (i < tmpl.length) {
    const current = tmpl[i];
		// console.log('current:', current);
    switch (currentStatus) {
      case 0:
        if (current !== "<") {
          throw new Error(
            `Unexpect express '${current}': expect '<' at start of template.`
          );
        }
        currentStatus = 1;
        break;
      case 1:
				if (isLowerCaseChar(current)) {
					currentReadingTagName = current;
					currentStatus = 2;
				} else {
          throw new Error(
            `tag name should start with lower case character`
          );
				}
				break;
			case 2:
				if (isLowerCaseChar(current)) {
					currentReadingTagName += current;
				} else if (current === ' ') {
					currentElement = new Element(currentReadingTagName);
					currentStatus = 3;
				}else if (current === '>') {
					domElementStack.push(new Element(currentReadingTagName));
					currentStatus = 4;
				} else {
          throw new Error(
            `unexpect character for tag name.`
          );
				}
				break;
			case 3:
				if (current === '>') {
          console.log("🚀 ~ file: tmplParser.js ~ line 131 ~ render ~ currentReadingTagName", currentReadingTagName)
					domElementStack.push(currentElement);
					currentChild = '';
					currentStatus = 4;
				} else if (current === '/') {
					currentStatus = 8;
				} else if (current !== ' ') {
					currentStatus = 5;
					currentAttrName = current;
				}
				break;
			case 4:
				if (current === '<') {
					if (currentChild.length) domElementStack[domElementStack.length - 1].children.push(currentChild);
					currentStatus = 9;
				} else {
					currentChild += current;
				}
				break;
			case 5:
				if (current !== '=') {
					currentAttrName += current;
				} else {
					currentStatus = 6;
				}
				break;
			case 6:
				if(current === '"' || current === "'") {
					currentAttrValue = '';
					currentStatus = 7;
				} else {
					throw new Error('unexpect character for attribute value');
				}
				break;
			case 7:
				if (current === '"') {
					currentStatus = 3;
					currentElement.attrs[currentAttrName] = currentAttrValue;
				} else {
					currentAttrValue += current;
				}
				break;
			case 8:
				if (current === '>') {
          console.log("🚀 ~ file: tmplParser.js ~ line 131 ~ render ~ currentReadingTagName", currentReadingTagName)
					domElementStack[domElementStack.length - 1].children.push(currentElement);
					currentStatus = 4;
				}
				break;
			case 9:
				if (current === '/') {
					currentStatus = 10;
					currentReadingTagName = '';
				}else if (isLowerCaseChar(current)) {
					currentReadingTagName = current;
					currentStatus = 2;
				} else {
						throw new Error(`unexpect character for tag start`);
				}
				break;
			case 10:
				if (current === '>') {
					const element = domElementStack.pop();
					if (element.tagName !== currentReadingTagName) {
						throw new Error(`element tag name not match, expect ${element.tagName}, get ${currentReadingTagName}`);
					} else if (domElementStack.length === 0) {
						currentStatus = 11;
						rootElement = element;
					} else {
						domElementStack[domElementStack.length - 1].children.push(element);
						currentStatus = 4;
					}
				} else {
					currentReadingTagName += current;
				}
				break;
    }
		i += 1;
  }

	function scopehtmlParse(str) {
		return str.replace(/\{\{(.*?)\}\}/g, (s0, s1) => {
			let props = s1.split(".");
			let val = data;
			props.forEach(key => val = val[key]);
			return val
		})
	}

	function vNodeToDOM(elem) {
		if (typeof elem === 'string') {
			return scopehtmlParse(elem);
		}
		console.log("🚀 ~ file: tmplParser.js ~ line 172 ~ vNodeToDOM ~ elem", elem)
		if (elem.attrs['v-if'] && !scopehtmlParse(elem.attrs['v-if'])) return null;
		const dom = document.createElement(elem.tagName);
		Object.keys(elem.attrs).forEach(key => {
			if (key !== 'v-if') {
				dom.setAttribute(key, scopehtmlParse(elem.attrs[key]));
			}
		})
		elem.children.forEach(child => {
			const childDOM = vNodeToDOM(child);
			childDOM && dom.append(childDOM);
		})
		return dom;
	}

	const rootDOM = vNodeToDOM(rootElement);
  // console.log("🚀 ~ file: tmplParser.js ~ line 190 ~ render ~ rootDOM", rootDOM)
	return rootDOM.outerHTML;
}

render(tmpl, {
  image: "some img",
  info: { showImage: true, showDate: false, name: "aaa" },
});
