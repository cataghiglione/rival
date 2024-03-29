package model;

import javax.persistence.*;
import java.util.Date;
import java.util.List;


@Entity
public class Match {
    @Id
    @GeneratedValue(generator = "MatchGen", strategy = GenerationType.SEQUENCE)
    private long id;

//    @Column
//    private String latitude;
//
//    @Column
//    private String longitude;


    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "SEARCH1_ID", referencedColumnName = "id")
    private Search search1;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "SEARCH2_ID", referencedColumnName = "id")
    private Search search2;

    @Column
    private boolean confirmed_by_1;
    @Column
    private boolean confirmed_by_2;

    @Column
    private boolean not_declined_by_1;
    @Column
    private boolean not_declined_by_2;

    public static Match create(Search search1, Search search2){
        return new Match(search1, search2);
    }
    public Match(){}
    private Match(Search search1, Search search2){
        this.search1=search1;
        this.search2=search2;
        this.confirmed_by_2 = false;
        this.confirmed_by_1 = false;
        this.not_declined_by_1 = true;
        this.not_declined_by_2 = true;

    }
//    public Match assignTeam2(Team team2){
//        setTeam2(team2);
//        return this;
//    }
//    private void setTeam2(Team team2){
//        this.team2=team2;
//    }

    public int getMonth() {
        return search1.getDate().getMonth();
    }

    public int getDay() {
        return search1.getDate().getDate();
    }

    public int getYear() {
        return search1.getDate().getYear();
    }

    public List<String> getTime() {
        return search1.getTime().sameIntervals(search2.getTime().getIntervals());
    }

    public Team getTeam1() {
        return search1.getTeam();
    }

    public Team getTeam2() {
        return search2.getTeam();
    }

    public boolean isConfirmed_by_1() {
        return confirmed_by_1;
    }

    public boolean isConfirmed_by_2() {
        return confirmed_by_2;
    }

    public boolean isConfirmed() {
        return confirmed_by_1 && confirmed_by_2;
    }

    public void setConfirmed_by_1(boolean state){
        confirmed_by_1=state;
    }
    public void setConfirmed_by_2(boolean state){
        confirmed_by_2=state;
    }



    public Long getId(){
        return id;
    }

    public boolean isPossible(){
        return ((search1.searching() && search2.searching()) || (confirmed_by_1 && search2.searching()) || (confirmed_by_2 && search1.searching())) && not_declined_by_1 && not_declined_by_2;
    }
    public Search getSearch1(){
        return search1;
    }

    public Search getSearch2() {
        return search2;
    }
}
