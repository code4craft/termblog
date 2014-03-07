package us.codecraft.blog.spider;

import us.codecraft.webmagic.Page;
import us.codecraft.webmagic.Site;
import us.codecraft.webmagic.model.AfterExtractor;
import us.codecraft.webmagic.model.OOSpider;
import us.codecraft.webmagic.model.annotation.ExtractBy;
import us.codecraft.webmagic.model.annotation.Formatter;
import us.codecraft.webmagic.model.annotation.HelpUrl;
import us.codecraft.webmagic.model.annotation.TargetUrl;

import java.util.Date;

/**
 * @author code4crafter@gmail.com
 */
@TargetUrl("http://my.oschina.net/flashsword/blog/\\d+")
@HelpUrl("http://my.oschina.net/flashsword/blog\\?disp=1&catalog=0&sort=time&p=\\d+")
public class OschinaBlog implements Comparable<OschinaBlog>,AfterExtractor{

    @ExtractBy("//title/regex('>(.+?)\\s+\\-',1)")
    private String title;

    @ExtractBy("//div[@class=BlogContent]")
    private String content;

    @ExtractBy("//span[@class=\"catalogs\"]//a/text()")
    private String category;

    @Formatter("yyyy-MM-dd HH:mm")
    @ExtractBy("//div[@class='BlogStat']/regex('\\d+-\\d+-\\d+\\s+\\d+:\\d+')")
    private Date date;

    public static void main(String[] args) {
        JstermJsonPipleine jstermJsonPipleine = new JstermJsonPipleine("/Users/yihua/codecraft/blog/json");
        OOSpider.create(Site.me(),
                jstermJsonPipleine, OschinaBlog.class)
                .addUrl("http://my.oschina.net/flashsword/blog").run();
        jstermJsonPipleine.flush();
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getCategory() {
        return category;
    }

    public Date getDate() {
        return date;
    }

    @Override
    public int compareTo(OschinaBlog o) {
        return date.compareTo(o.date);
    }

    @Override
    public void afterProcess(Page page) {
        title = title.replaceAll("\\s+","_");
        category = category.replaceAll("\\s+","_");
    }
}
