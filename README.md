# PrettyTrusts
Visualizes the output of [PowerView's](https://github.com/PowerShellMafia/PowerSploit/blob/dev/Recon/PowerView.ps1) `Get-DomainTrustMapping | Export-CSV -NoTypeInformation trusts.csv`. Hand it the csv file and get a pretty diagram to play with!

*Should* work with older and new PowerView outputs.

Everything is processed client-side, and no resources are loaded from outside of this repository. You can just clone/download the repository and open index.html in a browser to get started!

You can choose to have arrows display direction of access (default) or direction of trust (how Microsoft talks about trusts).

Colors and display are based off of Harmj0y's [TrustVisualizer](https://github.com/HarmJ0y/TrustVisualizer).
The provided trust mapping examples are taken from various Harmj0y blogposts:
[Domain Trusts: Why You Should Care](http://www.harmj0y.net/blog/redteaming/domain-trusts-why-you-should-care/)
[A Guide to Attacking Domain Trusts](http://www.harmj0y.net/blog/redteaming/a-guide-to-attacking-domain-trusts/)

Credit to other projects that came before:
[TrustVisualizer](https://github.com/HarmJ0y/TrustVisualizer)
[DomainTrustExplorer](https://github.com/sixdub/DomainTrustExplorer/)
[domain-trust-grapher](https://github.com/tomsteele/domain-trust-grapher)