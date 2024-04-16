export const getGithubFiles = async () => {
    const response = await fetch(
    "https://api.github.com/repos/CodeVault-LLC/codevault/git/trees/12b0e6fcfbc15b6228a7f2ae8418d05995228f3c"
    );

    const data = await response.json();

    return data;
}
