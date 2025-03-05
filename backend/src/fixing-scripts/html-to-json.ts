import axios from 'axios';
// import * as cheerio from 'cheerio';
import {Element, Text} from 'domhandler';

const cheerio = require('cheerio');


export async function transformHTMLtoJSON(html: string) {
  try {
    const $ = cheerio.load(html);

    const element = $('html')[0];

    return parseElement(element as any);
  } catch (error) {
    console.error('Error scraping or transforming:', error);

    return null;
  }
}


export async function scrapeAndTransformPageToJSON(url: string) {
  const { data: html } = await axios.get(url);

  return transformHTMLtoJSON(html);
}


function parseTextNode(node: Text, parentTextValue: string | string[]): string | string[] {
  const textContent = node.data.trim();

  if (!parentTextValue) {
    return textContent;
  }

  const resultTextList = Array.isArray(parentTextValue) ? parentTextValue : [parentTextValue];

  return [...resultTextList, textContent];
}


function checkParsedElementHasUsefullContent(elementJSON: any): boolean {
  const elementKeys = Object.keys(elementJSON);

  const uselessAttributes = ['id', 'class'];

  const uselessAttributesKeys = uselessAttributes.map(a => `@${a}`);

  const usefulElementKey = elementKeys.filter(k => !uselessAttributesKeys.includes(k));

  return usefulElementKey.length > 0;
}


function parseElement(element: Element) {
  const skipTagNameList = ['script', 'style', 'link', 'noscript'];
  const tagNameListWithOptionalAttributes = ['a', 'img', 'video', 'source', 'meta'];
  const optionalAttributeList = ['href', 'src', 'alt', 'title', 'name', 'property', 'content'];
  const requiredAttributesList = ['id', 'class'];

  const tagName = element.tagName.toLowerCase();
  const elementContent: any = {};

  let attributeList = requiredAttributesList;

  if (tagNameListWithOptionalAttributes.includes(tagName)) {
    attributeList = [...attributeList, ...optionalAttributeList];
  }

  attributeList.forEach(attr => {
    if (!element.attribs?.[attr]) {
      return;
    }

    elementContent[`@${attr}`] = element.attribs[attr];
  });

  element.children.forEach(child => {
    if (child.type === 'text' && child.data.trim()) {
      elementContent.text = parseTextNode(child, elementContent.text);

      return;
    }

    if (child.type !== 'tag') {
      return;
    }

    const childTagName = child.tagName.toLowerCase();

    if (skipTagNameList.includes(childTagName)) {
      return;
    }

    const parsedChild = parseElement(child);

    if (!parsedChild) {
      return;
    }

    if (!elementContent?.[childTagName]) {
      elementContent[childTagName] = parsedChild;

      return;
    }

    // If the tag already exists, convert it into an array
    if (!Array.isArray(elementContent[childTagName])) {
      elementContent[childTagName] = [elementContent[childTagName]];
    }

    elementContent[childTagName].push(parsedChild);
  });

  return checkParsedElementHasUsefullContent(elementContent) ? elementContent : null;
}
