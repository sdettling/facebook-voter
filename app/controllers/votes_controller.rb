class VotesController < ApplicationController
  def create
    @vote = Vote.new(params[:vote])
    respond_to do |format|
      if @vote.save
        format.json { render json @vote }
      else
        format.json { render json @vote.errors, status: :unprocessable_entity }
      end
  end
  def update
  end
end
