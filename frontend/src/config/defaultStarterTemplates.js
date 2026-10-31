// Judge0 receives complete source files, so these are intentionally executable
// program shells rather than problem-specific function signatures.
export const DEFAULT_STARTER_TEMPLATES = [
  {
    language: 'C++',
    initialCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Write your solution here.
    return 0;
}`
  },
  {
    language: 'Java',
    initialCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // Write your solution here.
    }
}`
  },
  {
    language: 'JavaScript',
    initialCode: `'use strict';

const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);

// Write your solution here.`
  }
];

const normalizeLanguage = (language = '') => language.toLowerCase().replace(/[^a-z0-9+]/g, '');

export const getStarterTemplates = (savedTemplates = []) =>
  DEFAULT_STARTER_TEMPLATES.map((defaultTemplate) => {
    const savedTemplate = savedTemplates.find(
      (template) => normalizeLanguage(template?.language) === normalizeLanguage(defaultTemplate.language)
    );

    // An existing string, including an intentionally blank one, belongs to the
    // saved problem and must not be silently replaced.
    return {
      language: defaultTemplate.language,
      initialCode: typeof savedTemplate?.initialCode === 'string'
        ? savedTemplate.initialCode
        : defaultTemplate.initialCode
    };
  });

export const getStarterCodeForLanguage = (savedTemplates, language) => {
  const templates = getStarterTemplates(savedTemplates);
  return templates.find(
    (template) => normalizeLanguage(template.language) === normalizeLanguage(language)
  )?.initialCode || '';
};
