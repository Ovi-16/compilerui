import { Tokenizer, Token, TokenType, Matcher } from './types/tokenizer';
export const keywords = ["print","def","var","if","else","elif","while"];
export const operators=["+","-","*","/",",","!", "&&", "||",">=","<=","<", ">","==","!="];

export class TokenizerError extends Error {
  index: number;
  constructor(message: string, index: number) {
    super(message);
    this.index = index;
  }
}

// returns a token if the given regex matches at the current index
const regexMatcher = (regex: string, type: TokenType): Matcher => (//this function is returning a function of type matcher
  input,
  index
) => {
  const match = input.substring(index).match(regex);
  //!.substring from the index to the end 
  //of the string
  //!.match applies the particular regex on the 
  //substring and if there is anyhting that matches 
  //then is inserted and returned in an array otherewise just returns null

  return (
    match && {
      type,
      value: match[0]
    }
    //if match is not null then will retrun the object in {} with properties type:type and value:...
  );
};

// matchers in precedence order
const matchers = [
  regexMatcher("^[.0-9]+", "number"),
  regexMatcher(`^(${keywords.join("|")})`, "keyword"),
  regexMatcher("^\\s+", "whitespace"),
  regexMatcher("^input", "input"),
  regexMatcher("^[a-zA-Z_][a-zA-Z0-9_]*", "identifier"), // Matches identifiers (function names, variable names)
  regexMatcher("^\\(", "lparen"), // Matches "("
  regexMatcher("^\\)", "rparen"), // Matches ")"
  regexMatcher("^:", "colon"), // Matches ":"
  regexMatcher("^\\{", "indent"), // Matches indent (if using braces, modify as needed)
  regexMatcher("^\\}", "dedent"),
  regexMatcher(`^(${operators.map(op => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`,"operator"),
  regexMatcher("^=","assignment"),
  
  // regexMatcher("^\t", "indent"),
  // regexMatcher("^\t$", "dedent")
];

const locationForIndex = (input: string, index: number) => ({
  char: index - input.lastIndexOf("\n", index) - 1,
  //0 1 2  3 
  //A B C \n
  //4 5 6 
  //_ D E
  //index(of whitespace):4
  //lastIndexOf finds the index
  //of the new line character right before or at the 
  //whitespace (index)
  //in this case is 3 so char:(4-3)-1 
  //char:0
  //to find the line number it gets the substring of the string up to the index
  //then splits with the new-line character as the delimiter and puts the individuval 
  //lines in an array and then get's the length but subtract 1 to get the lines index from 0
  
  line: input.substring(0, index).split("\n").length - 1
});

export const tokenize: Tokenizer = input => {
  const tokens: Token[] = [];//initializing empty array of token type
  let index = 0;//variavle to keep track of current position in input string
  while (index < input.length) {//loops through the full string 
    const matches = matchers.map(m => m(input, index)).filter(f => f);
    //console.log(matches)
    //! goes through each matcher using the map
    //which each contains 3 different function calls 
    //which each of the function calls itself return 
    //a function which take index and input as arguements
    //!then filters out all undefined values or nulls which
    //may have been returned by some of the 3 function calls
    if (matches.length > 0) {
      // take the highest priority match
      const match = matches[0];
      if (match.type !== "whitespace") {
        tokens.push({ ...match, ...locationForIndex(input, index) });
        //unpack the match object as well as the 
      }
      index += match.value.length;
    } else {
      throw new TokenizerError(
        `Unexpected token ${input.substring(index, index + 1)}`,
        index
      );
    }
  }
  return tokens;
};
// const src="print 12 print 12"
// const src = `
// print 12 <= 13
// `;

// const tokens=tokenize(src)
// console.log(tokens)