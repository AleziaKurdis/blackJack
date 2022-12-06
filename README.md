# blackJack
Black Jack Game for Overte virtual world.  
  
  
## INSTALLATION  

### Server side script  
The game need to have this Assignment Client Script running on your domain server:  
**https://aleziakurdis.github.io/blackJack/AC_blackJack.js**  
In your Domain Server control panel, menu "**Content > Scripts**"  
  
   
### Black Jack Table (in-world)
To import the Black Jack table in-world (in your domain):  
  
From the "**Create**" application, from "**Entity List**" tab   
Do "**Edit > Import Entities (.json) From a URL**"    
Select this URL: **https://aleziakurdis.github.io/blackJack/INSTALL_BlackJackTable.json**  
  
**Note:** Select the black Jack table to position table and seats.  
  
  
### Multiple tables in a same domain...  
This will work with only one table per domain.  
if for any reason you would like to run many Black Jack Tables, you will need to have a separated set of script and modify the communication channel in most of the scripts (Find & Replace):  
*var channelComm = "ak.blackJack.ac.communication";*  
  
You can simply add a few characters to that string to make it different from the original one.  
Make sure the url in the file **INSTALL_BlackJackTable.json** get modified accordingly to use the new set of scripts and resources.
