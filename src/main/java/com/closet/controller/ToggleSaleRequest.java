package com.closet.controller;

public class ToggleSaleRequest {
    private Double price;
    private String size;
    private String user;

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
}