package model;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;


@Entity
public class Search {
    @Id
    @GeneratedValue(generator = "increment")
    @GenericGenerator(name = "increment", strategy = "increment")
    private Long id;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "TEAM_ID", referencedColumnName = "id")
    private Team team;

    @Column
    private boolean isSearching;

    @Column
    private boolean isRecurring;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "TIME_ID", referencedColumnName = "id")
    private TimeInterval time;

    @Column
    private String latitude;

    @Column
    private String longitude;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "DATE_ID", referencedColumnName = "id")
    private model.Date date;


    @Column
    private int minAge;
    @Column
    private int maxAge;
    @Column
    private Long recurrentSearchId;


    public Search() {
    }

    private Search(Team team, Date date, List<String> time,String latitude, String longitude, boolean isRecurring, int minAge, int maxAge) {
        this.team=team;
        this.isSearching=true;
        this.time=new TimeInterval(time);
        this.latitude=latitude;
        this.longitude=longitude;
        this.date= new model.Date(date.getDate(),date.getMonth(),date.getYear(),date.getDay());
        this.isRecurring=isRecurring;
        this.recurrentSearchId = (long) -1;
        this.minAge = minAge;
        this.maxAge = maxAge;


    }
    public static Search create(Team team, Date date, List<String> time,String latitude,String longitude, boolean isRecurring, int minAge, int maxAge){
        return new Search(team, date,time,latitude,longitude,isRecurring,minAge,maxAge);
    }
    private void setSearching(boolean value){
        this.isSearching=value;
    }
    public void cancelSearching(){
        setSearching(false);
    }
    public void reactivateSearching(){
        setSearching(true);
    }

    public String getLatitude() {
        return latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public Team getTeam() {
        return team;
    }

    public int getMinAge() {
        return minAge;
    }

    public int getMaxAge() {
        return maxAge;
    }

    public void isSearching() {
        isSearching = true;
    }

    public void isNotSearching(){
        isSearching = false;
    }

    public model.Date getDate() {
        return date;
    }

    public boolean searching(){
        return isSearching;
    }

    public TimeInterval getTime() {
        return time;
    }
    public Long getRecurrentSearchId(){
        return recurrentSearchId;
    }
    public void setRecurrentSearchId(Long value){
        this.recurrentSearchId=value;
    }

//    public int getMonth() {
//        return month;
//    }
//
//    public int getDay() {
//        return day;
//    }
//
//    public int getYear() {
//        return year;
//    }

    public long getId() {
        return id;
    }



    public boolean isRecurring() {
        return isRecurring;
    }

}
